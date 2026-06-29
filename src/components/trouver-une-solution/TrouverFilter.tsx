"use client";

import Image from "next/image";
import { Search, ChevronDown, Undo2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

function CustomSelect({
  placeholder,
  options,
}: {
  placeholder: string;
  options: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
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
        className="flex items-center justify-between w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A]"
      >
        <span className={selected ? "text-slate-900" : "text-slate-500"}>
          {selected || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-lg shadow-lg overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                selected === option
                  ? "bg-[#BC0D2A]/10 text-[#BC0D2A] font-medium"
                  : "text-slate-700 hover:bg-slate-50 hover:text-[#BC0D2A]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TrouverFilter() {
  return (
    <section className="bg-white w-full pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Main Application Container */}
        <div className="w-full flex flex-col lg:flex-row border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm min-h-[700px]">
          {/* Left Sidebar (Filters) */}
          <div className="w-full lg:w-[320px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 p-8 flex flex-col gap-8 bg-white z-10">
            {/* Header */}
            <div>
              <h2 className="font-[family-name:var(--font-inter)] text-2xl font-bold text-[#BC0D2A] tracking-tight mb-2">
                Critères
              </h2>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                Sélectionnez vos critères pour trouver la meilleure solution.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-sm placeholder:text-slate-400 text-slate-900"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 relative z-30">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Sélectonner votre culture ?
                </label>
                <CustomSelect
                  placeholder="Culture"
                  options={["Culture 1", "Culture 2", "Culture 3"]}
                />
              </div>

              <div className="flex flex-col gap-2 relative z-20">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quel est votre problématique ?
                </label>
                <CustomSelect
                  placeholder="Problématique"
                  options={["Problématique 1", "Problématique 2", "Problématique 3"]}
                />
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quel est votre mode d'utilisation/stade ?
                </label>
                <CustomSelect
                  placeholder="Mode"
                  options={["Mode 1", "Mode 2", "Mode 3"]}
                />
              </div>
            </div>
          </div>

          {/* Right Area (Results) */}
          <div className="flex-1 p-8 lg:p-10 flex flex-col bg-[#fcfbfc] z-0">
            {/* Results Header */}
            <div className="flex flex-col gap-4 mb-8">
              <button className="flex items-center gap-1.5 text-[#BC0D2A] text-[13px] font-semibold hover:underline w-fit">
                <Undo2 size={14} strokeWidth={2.5} />
                Reset
              </button>

              <div className="pb-4 border-b border-slate-200">
                <h3 className="font-[family-name:var(--font-inter)] text-xl font-bold text-slate-900 tracking-tight">
                  Notre Recommandation
                </h3>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center p-6 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-xl"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[4/5] max-w-[160px] mx-auto mb-6">
                    <Image
                      src="https://images.unsplash.com/photo-1617838575003-886f3780caba?q=80&w=400&auto=format&fit=crop"
                      alt="Acide Sulfurique Product"
                      fill
                      className="object-contain"
                    />
                    {/* Fallback Red Overlay if image is not a perfect jerrycan */}
                    <div className="absolute inset-0 bg-[#BC0D2A] mix-blend-multiply opacity-50 rounded-lg pointer-events-none"></div>
                  </div>
                  {/* Product Title */}
                  <h4 className="font-[family-name:var(--font-inter)] font-bold text-[#202737] text-base text-center tracking-tight">
                    Acide Sulfurique
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
