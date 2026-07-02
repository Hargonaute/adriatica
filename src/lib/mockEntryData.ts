/**
 * Generates a fake entry record for a collection so bound blocks in the
 * template editor render something realistic even before any real entry exists.
 */

export interface MockFieldSchema {
  key: string;
  label: string;
  type: string;
}

const SAMPLE_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
       <rect width="400" height="300" fill="#e2e8f0"/>
       <text x="200" y="150" fill="#94a3b8" font-family="sans-serif" font-size="16"
             text-anchor="middle" dominant-baseline="middle">Sample image</text>
     </svg>`
  );

export function buildMockEntryData(fields: MockFieldSchema[]): Record<string, any> {
  const data: Record<string, any> = {};
  for (const f of fields) {
    const label = f.label || f.key;
    switch (f.type) {
      case 'text':
        data[f.key] = `Sample ${label}`;
        break;
      case 'number':
        data[f.key] = 42;
        break;
      case 'email':
        data[f.key] = 'sample@example.com';
        break;
      case 'date':
        data[f.key] = new Date().toISOString();
        break;
      case 'textarea':
        data[f.key] =
          `This is a sample ${label.toLowerCase()} used only to preview the template. ` +
          `Real content will appear here once the collection has entries.`;
        break;
      case 'checkbox':
        data[f.key] = true;
        break;
      case 'rich-text':
        data[f.key] =
          `<p>This is <strong>sample rich-text</strong> content for the "${label}" field.</p>` +
          `<p>Designers see this placeholder in the template editor; real entries replace it at render time.</p>`;
        break;
      case 'image':
        data[f.key] = SAMPLE_IMAGE;
        break;
      default:
        data[f.key] = `Sample ${label}`;
    }
  }
  return data;
}
