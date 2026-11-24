import snapshot from './products.snapshot.json';
import { SHOP_DOMAIN } from './site';
import type { ImageMetadata } from 'astro';

import espresso from '../assets/bags/kolkin-espresso-blend.png';
import guatemala from '../assets/bags/guatemala-huehuetenango.png';
import huila from '../assets/bags/columbia-huilla-natural.png';
import ethiopia from '../assets/bags/ethiopia-yirgacheffe.png';
import decaf from '../assets/bags/columbia-decaf.png';

const labels = import.meta.glob<{ default: ImageMetadata }>('../assets/labels/*.jpg', { eager: true });
const labelFor = (handle: string) => labels[`../assets/labels/${handle}.jpg`]?.default;

type Raw = (typeof snapshot.products)[number];

export interface Variant { id: number; title: string; price: number; compareAt: number | null; available: boolean }
export interface Product {
  id: number;
  handle: string;
  title: string;
  origin: string; // headline word, as printed on the bag label
  region: string; // sub-line, as printed on the bag label
  notes: string[];
  roast?: string;
  process?: string;
  varietal?: string;
  grind?: string;
  variants: Variant[];
  priceFrom: number;
  available: boolean;
  bag: ImageMetadata;
  label?: ImageMetadata; // close-up of the printed bag label
  accent: string; // label band colour on the physical bag
  accentInk: string;
  tint: string;
  shopifyUrl: string;
  summary: string; // composed only from verified attributes
}

// Presentation overlay only. Origin / region lines mirror the printed bag label.
const overlay: Record<string, Pick<Product, 'origin' | 'region' | 'bag' | 'accent' | 'accentInk' | 'tint'>> = {
  'kolkin-espresso-blend': { origin: 'Espresso', region: 'Kølkin Blend', bag: espresso, accent: '#7A5236', accentInk: '#F4EDE3', tint: '#E6D8C8' },
  'guatemala-huehuetenango': { origin: 'Guatemala', region: 'Huehuetenango', bag: guatemala, accent: '#E07F45', accentInk: '#1B120C', tint: '#EED6C2' },
  'columbia-huilla-natural': { origin: 'Colombia', region: 'Huilla-Excelso', bag: huila, accent: '#1D3A5A', accentInk: '#F2ECE1', tint: '#D5DADB' },
  'ethiopia-yirgacheffe': { origin: 'Ethiopia', region: 'Yirgacheffe', bag: ethiopia, accent: '#EBCB72', accentInk: '#1E1A10', tint: '#EFE5C8' },
  'columbia-decaf': { origin: 'Colombia', region: 'Decaf', bag: decaf, accent: '#2A4766', accentInk: '#F2ECE1', tint: '#DAD9D2' },
};

// Source typos corrected to match the printed bag labels ("Nutty", "Black Tea").
const fixNote = (n: string) => n.trim().replace(/^B\s+lack/i, 'Black').replace(/^Nutt$/i, 'Nutty');

const order = ['kolkin-espresso-blend', 'guatemala-huehuetenango', 'columbia-huilla-natural', 'ethiopia-yirgacheffe', 'columbia-decaf'];

const list = (a: string[]) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a.at(-1)}`);

function build(p: Raw): Product {
  const o = overlay[p.handle] ?? { origin: p.title, region: '', bag: espresso, accent: '#3B2A20', accentInk: '#F2ECE1', tint: '#E7DED2' };
  const s = p.specs as Record<string, string | undefined>;
  const notes = (s['Tasting Notes'] ?? '').split(',').map(fixNote).filter(Boolean);
  const variants = p.variants.map(({ id, title, price, compareAt, available }) => ({ id, title, price, compareAt, available }));
  const summary = [
    notes.length ? `Notes of ${list(notes.map((n) => n.toLowerCase()))}.` : '',
    s['Varietal'] ? `${s['Varietal']} ${/,/.test(s['Varietal']) ? 'varietals' : 'varietal'}.` : '',
    s['Process'] ? `${s['Process']} process.` : '',
    s['Roast'] ? `${s['Roast']} roast, ${(s['Grind Type'] ?? 'whole bean').toLowerCase()}.` : '',
  ].filter(Boolean).join(' ');
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    ...o,
    label: labelFor(p.handle),
    notes,
    roast: s['Roast'],
    process: s['Process'],
    varietal: s['Varietal'],
    grind: s['Grind Type'],
    variants,
    priceFrom: Math.min(...variants.map((v) => v.price)),
    available: variants.some((v) => v.available),
    shopifyUrl: `${SHOP_DOMAIN}/products/${p.handle}`,
    summary,
  };
}

export const products: Product[] = snapshot.products
  .map(build)
  .sort((a, b) => (order.indexOf(a.handle) + 1 || 99) - (order.indexOf(b.handle) + 1 || 99));

export const getProduct = (handle: string) => products.find((p) => p.handle === handle);
export const money = (n: number) => `$${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}`;
export const syncedAt = snapshot.syncedAt;
