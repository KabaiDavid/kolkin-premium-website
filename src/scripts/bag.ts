// Client bag. Holds Shopify variant IDs only; checkout is handed to Shopify via a cart
// permalink (https://shopify.dev/docs/apps/build/checkout/create-cart-permalinks), so
// prices, inventory, shipping, tax and payment are always resolved by Shopify itself.
import { SHOP_DOMAIN } from '../data/site';

export interface BagLine {
  variantId: number;
  handle: string;
  title: string;
  variantTitle: string;
  price: number;
  qty: number;
  image?: string;
}

const KEY = 'kolkin:bag:v1';
const MAX_QTY = 99;
let memory: BagLine[] = [];

function read(): BagLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((l) => l && Number.isFinite(l.variantId) && l.qty > 0) : [];
  } catch {
    return memory;
  }
}

function write(lines: BagLine[]) {
  memory = lines;
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* private mode: keep in memory */ }
  document.dispatchEvent(new CustomEvent('bag:change', { detail: lines }));
}

export const bag = {
  lines: read,
  count: () => read().reduce((n, l) => n + l.qty, 0),
  subtotal: () => read().reduce((n, l) => n + l.qty * l.price, 0),
  add(line: Omit<BagLine, 'qty'>, qty = 1) {
    const lines = read();
    const hit = lines.find((l) => l.variantId === line.variantId);
    if (hit) hit.qty = Math.min(MAX_QTY, hit.qty + qty);
    else lines.push({ ...line, qty: Math.min(MAX_QTY, qty) });
    write(lines);
  },
  setQty(variantId: number, qty: number) {
    const lines = read()
      .map((l) => (l.variantId === variantId ? { ...l, qty: Math.max(0, Math.min(MAX_QTY, qty)) } : l))
      .filter((l) => l.qty > 0);
    write(lines);
  },
  remove(variantId: number) { write(read().filter((l) => l.variantId !== variantId)); },
  clear() { write([]); },
  checkoutUrl() {
    const lines = read();
    if (!lines.length) return `${SHOP_DOMAIN}/collections/all`;
    return `${SHOP_DOMAIN}/cart/${lines.map((l) => `${l.variantId}:${l.qty}`).join(',')}?ref=kolkin-web`;
  },
};

export const money = (n: number) => `$${n.toFixed(2)}`;

// Keep tabs in sync.
window.addEventListener('storage', (e) => {
  if (e.key === KEY) document.dispatchEvent(new CustomEvent('bag:change', { detail: read() }));
});
