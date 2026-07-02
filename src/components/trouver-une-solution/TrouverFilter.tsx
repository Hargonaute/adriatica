"use client";

import Image from "next/image";
import { Search, ChevronDown, Undo2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const COLLECTION_SLUG = "produit";
const CULTURE_KEY = "culture";
const PROBLEMATIQUE_KEY = "problematique";
const STADE_KEY = "stade_mode_d_utilisation_";
//ttt
type FieldDef = {
  id: string;
  key: string;
  label: string;
  type: string;
  order: number | null;
};

type CollectionMeta = {
  id: string;
  slug: string;
  name: string;
  itemSlugField: string | null;
  fields: FieldDef[];
};

type Entry = {
  id: string;
  collectionId: string;
  data: Record<string, unknown>;
};

function CustomSelect({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: string[];
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full text-left" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={value ?? undefined}
        className="flex items-center justify-between gap-2 w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A]"
      >
        <span
          className={`flex-1 min-w-0 truncate text-left ${
            value ? "text-slate-900" : "text-slate-500"
          }`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-lg shadow-lg overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200 max-h-64 overflow-y-auto">
          {value !== null && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-sm text-slate-500 italic hover:bg-slate-50"
            >
              Tous
            </button>
          )}
          {options.length === 0 ? (
            <div className="px-3 py-2.5 text-sm text-slate-400">Aucune option</div>
          ) : (
            options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                  value === option
                    ? "bg-[#BC0D2A]/10 text-[#BC0D2A] font-medium"
                    : "text-slate-700 hover:bg-slate-50 hover:text-[#BC0D2A]"
                }`}
              >
                {option}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function getStringValue(entry: Entry, key: string): string {
  const v = entry.data?.[key];
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function uniqueValues(entries: Entry[], key: string): string[] {
  const set = new Set<string>();
  for (const e of entries) {
    const v = getStringValue(e, key).trim();
    if (v) set.add(v);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
}

export function TrouverFilter() {
  const [collection, setCollection] = useState<CollectionMeta | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [culture, setCulture] = useState<string | null>(null);
  const [problematique, setProblematique] = useState<string | null>(null);
  const [stade, setStade] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const listRes = await fetch("/api/collections");
        if (!listRes.ok) throw new Error("Failed to load collections");
        const list = (await listRes.json()) as Array<{ id: string; slug: string }>;
        const match = list.find((c) => c.slug === COLLECTION_SLUG);
        if (!match) throw new Error(`Collection "${COLLECTION_SLUG}" not found`);

        const [metaRes, entriesRes] = await Promise.all([
          fetch(`/api/collections/${match.id}`),
          fetch(`/api/entries?collectionId=${match.id}`),
        ]);
        if (!metaRes.ok) throw new Error("Failed to load collection metadata");
        if (!entriesRes.ok) throw new Error("Failed to load entries");

        const meta = (await metaRes.json()) as CollectionMeta;
        const data = (await entriesRes.json()) as Entry[];

        if (cancelled) return;
        setCollection(meta);
        setEntries(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const nameKey = useMemo(() => {
    if (!collection) return null;
    if (collection.itemSlugField) return collection.itemSlugField;
    const ordered = [...collection.fields].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
    const firstText = ordered.find((f) => f.type === "text");
    return (firstText ?? ordered[0])?.key ?? null;
  }, [collection]);

  const cultureOptions = useMemo(() => uniqueValues(entries, CULTURE_KEY), [entries]);
  const problematiqueOptions = useMemo(
    () => uniqueValues(entries, PROBLEMATIQUE_KEY),
    [entries]
  );
  const stadeOptions = useMemo(() => uniqueValues(entries, STADE_KEY), [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (culture && getStringValue(e, CULTURE_KEY).trim() !== culture) return false;
      if (
        problematique &&
        getStringValue(e, PROBLEMATIQUE_KEY).trim() !== problematique
      )
        return false;
      if (stade && getStringValue(e, STADE_KEY).trim() !== stade) return false;
      if (q && nameKey) {
        const name = getStringValue(e, nameKey).toLowerCase();
        if (!name.includes(q)) return false;
      }
      return true;
    });
  }, [entries, culture, problematique, stade, search, nameKey]);

  const handleReset = () => {
    setCulture(null);
    setProblematique(null);
    setStade(null);
    setSearch("");
  };

  return (
    <section className="bg-white w-full pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="w-full flex flex-col lg:flex-row border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm min-h-[700px]">
          <div className="w-full lg:w-[320px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 p-8 flex flex-col gap-8 bg-white z-10">
            <div>
              <h2 className="font-[family-name:var(--font-inter)] text-2xl font-bold text-[#BC0D2A] tracking-tight mb-2">
                Critères
              </h2>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                Sélectionnez vos critères pour trouver la meilleure solution.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-sm placeholder:text-slate-400 text-slate-900"
              />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 relative z-30">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Sélectonner votre culture ?
                </label>
                <CustomSelect
                  placeholder="Culture"
                  options={cultureOptions}
                  value={culture}
                  onChange={setCulture}
                />
              </div>

              <div className="flex flex-col gap-2 relative z-20">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quel est votre problématique ?
                </label>
                <CustomSelect
                  placeholder="Problématique"
                  options={problematiqueOptions}
                  value={problematique}
                  onChange={setProblematique}
                />
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quel est votre mode d&apos;utilisation/stade ?
                </label>
                <CustomSelect
                  placeholder="Mode"
                  options={stadeOptions}
                  value={stade}
                  onChange={setStade}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 p-8 lg:p-10 flex flex-col bg-[#fcfbfc] z-0">
            <div className="flex flex-col gap-4 mb-8">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-[#BC0D2A] text-[13px] font-semibold hover:underline w-fit"
              >
                <Undo2 size={14} strokeWidth={2.5} />
                Reset
              </button>

              <div className="pb-4 border-b border-slate-200 flex items-baseline justify-between gap-4">
                <h3 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-900 tracking-tight">
                  Notre Recommandation
                </h3>
                {!loading && !error && (
                  <span className="text-sm text-slate-500">
                    {filtered.length} produit{filtered.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Chargement des produits…
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Aucun produit ne correspond à ces critères.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((entry) => {
                  const name = nameKey ? getStringValue(entry, nameKey) : entry.id;
                  return (
                    <div
                      key={entry.id}
                      className="flex flex-col items-center p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-xl"
                    >
                      <div className="relative w-full aspect-[4/5] max-w-[160px] mx-auto mb-6">
                        <Image
                          src="/produit_page_img/Adriatica Web Featured Icon.png"
                          alt={name}
                          fill
                          className="object-contain"
                        />
                        <div className="absolute inset-0 bg-[#BC0D2A] mix-blend-multiply opacity-50 rounded-lg pointer-events-none"></div>
                      </div>
                      <h4 className="font-[family-name:var(--font-inter)] font-bold text-[#202737] text-base text-center tracking-tight">
                        {name || "Sans titre"}
                      </h4>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
