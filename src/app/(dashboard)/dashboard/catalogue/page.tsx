import { requireDashboardSession } from '@/lib/auth/require-session';
import { getCatalogueIntros } from '@/lib/products/catalogueIntrosStore';
import { CATALOGUE_TERMS } from '@/lib/products/catalogueSlugs';
import { catalogueHref } from '@/lib/i18n/solutionHref';
import { INTRO_MAX_LENGTH } from '@/lib/products/catalogueIntros';
import { CatalogueIntrosForm, type IntroRow } from '@/components/dashboard/CatalogueIntrosForm';

export const dynamic = 'force-dynamic';

export default async function CatalogueIntrosPage() {
  await requireDashboardSession('/dashboard/catalogue');
  const intros = await getCatalogueIntros();

  const rows = (facet: 'famille' | 'culture'): IntroRow[] =>
    CATALOGUE_TERMS[facet].map((t) => ({
      facet,
      slug: t.slug,
      fr: t.fr,
      en: t.en,
      frHref: catalogueHref('fr', { [facet]: t.slug }),
      enHref: catalogueHref('en', { [facet]: t.slug }),
    }));

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Catalogue intros</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Short introduction shown under the title of each filtered catalogue page
          (“Trouver une solution” filtered by one famille or one culture). Leave a field
          empty to show no paragraph. Plain text; a blank line starts a new paragraph.
          Saved texts go live immediately.
        </p>
      </div>
      <CatalogueIntrosForm
        initial={intros}
        familles={rows('famille')}
        cultures={rows('culture')}
        maxLength={INTRO_MAX_LENGTH}
      />
    </div>
  );
}
