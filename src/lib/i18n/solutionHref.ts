import type { Locale } from './config';
import { pathForKey } from './pageSlugs';

/**
 * Link to the find-a-solution page with a filter query:
 * /fr/trouver-une-solution?famille=… or /en/find-a-solution?famille=…
 * `filterQuery` is the query string without "?". Returns undefined when empty.
 */
export function solutionFilterHref(locale: Locale, filterQuery?: string): string | undefined {
  const q = (filterQuery ?? '').replace(/^\?/, '').trim();
  if (!q) return undefined;
  return `${pathForKey('solution', locale)}?${q}`;
}
