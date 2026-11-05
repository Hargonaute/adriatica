/**
 * Comparison key shared by the product filter metadata (productMeta.ts) and the
 * frozen catalogue slug map (catalogueSlugs.ts). Kept in its own module so both
 * can import it without a cycle. Pure, dependency-free.
 */

/** Comparison key: case-, accent-, apostrophe- and dash-insensitive. */
export function foldKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}
