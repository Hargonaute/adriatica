'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LOCALES, type Locale } from '@/lib/i18n/config';
import { translateSlug, keyForSlug, STATIC_PAGE_SLUGS, type StaticPageKey } from '@/lib/i18n/pageSlugs';

export interface LanguageSwitcherProps {
  locale: Locale;
  variant?: 'desktop' | 'mobile';
}

function stripLocalePrefix(pathname: string, locale: Locale): string {
  const prefix = `/${locale}`;
  if (pathname === prefix) return '';
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname;
}

/**
 * Given a path suffix (everything after /{locale}), return the equivalent suffix
 * in the target locale. Handles static pages (via slug map) and passes DB /
 * collection paths through unchanged (DB pages use the same slug in both locales).
 */
function translatePath(suffix: string, from: Locale, to: Locale): string {
  if (!suffix) return '';
  const segments = suffix.split('/').filter(Boolean);
  if (segments.length === 0) return '';

  // Static page at first segment?
  const key = keyForSlug(segments[0], from);
  if (key) {
    const translated = STATIC_PAGE_SLUGS[key as StaticPageKey][to];
    return '/' + [translated, ...segments.slice(1)].join('/');
  }

  return '/' + segments.join('/');
}

export function LanguageSwitcher({ locale, variant = 'desktop' }: LanguageSwitcherProps) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const suffix = stripLocalePrefix(pathname, locale);

  function switchTo(next: Locale) {
    if (next === locale) return;
    const translated = translatePath(suffix, locale, next);
    startTransition(() => {
      router.push(`/${next}${translated}`);
    });
  }

  if (variant === 'mobile') {
    return (
      <div className="flex gap-2">
        {LOCALES.map((l) => {
          const active = l === locale;
          return (
            <button
              key={l}
              type="button"
              onClick={() => switchTo(l)}
              disabled={isPending}
              aria-pressed={active}
              className={`flex-1 inline-flex items-center justify-center min-h-[44px] px-3 text-sm font-semibold border rounded-md transition-colors disabled:opacity-60 ${
                active
                  ? 'text-slate-800 border-slate-300 bg-slate-50'
                  : 'text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {l.toUpperCase()}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="hidden lg:inline-flex items-center border border-slate-200 rounded-md overflow-hidden">
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => switchTo(l)}
            disabled={isPending}
            aria-pressed={active}
            className={`px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
              active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
