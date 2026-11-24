// Pulls the live Kølkin catalog from the Shopify storefront (public products.json)
// and writes a normalized snapshot used at build time.
// `--soft` keeps the committed snapshot if the network is unavailable.
import { writeFile, readFile } from 'node:fs/promises';

const SHOP = 'https://kolkin.coffee';
const OUT = new URL('../src/data/products.snapshot.json', import.meta.url);
const soft = process.argv.includes('--soft');

const strip = (html = '') =>
  html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h\d)>/gi, '\n').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/[ \t]+/g, ' ');

function parseSpecs(html) {
  const text = strip(html);
  const keys = ['Varietal', 'Process', 'Tasting Notes', 'Roast', 'Grind Type'];
  const specs = {};
  for (const key of keys) {
    const re = new RegExp(`${key}:\\s*([^\\n]*?)\\s*(?=(?:${keys.join('|')}):|\\n|$)`, 'i');
    const m = text.match(re);
    if (m && m[1].trim()) specs[key] = m[1].trim();
  }
  return specs;
}

async function main() {
  let data;
  try {
    const res = await fetch(`${SHOP}/products.json?limit=250`, { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    if (soft) {
      await readFile(OUT);
      console.warn(`[sync] Shopify unreachable (${err.message}); using committed snapshot.`);
      return;
    }
    throw err;
  }
  const products = data.products
    .filter((p) => (p.tags || []).includes('coffee') || /coffee/i.test(p.product_type || ''))
    .map((p) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      specs: parseSpecs(p.body_html),
      options: p.options.map((o) => ({ name: o.name, values: o.values })),
      variants: p.variants.map((v) => ({
        id: v.id,
        title: v.title,
        price: Number(v.price),
        compareAt: v.compare_at_price ? Number(v.compare_at_price) : null,
        available: v.available,
        sku: v.sku || null,
        grams: v.grams,
      })),
      image: p.images[0]?.src ?? null,
      updatedAt: p.updated_at,
    }));
  await writeFile(OUT, JSON.stringify({ syncedAt: new Date().toISOString(), products }, null, 2) + '\n');
  console.log(`[sync] ${products.length} products written.`);
}

main().catch((e) => {
  console.error('[sync] failed:', e);
  process.exit(1);
});
