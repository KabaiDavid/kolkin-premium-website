// Global UI: header state, mobile menu, bag drawer, reveal-on-scroll.
import { bag, money } from './bag';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const html = document.documentElement;

/* ── Header: transparent over hero → solid; hides on scroll down ── */
const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  let lastY = scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('is-solid', y > 40);
    const menuOpen = document.querySelector('dialog[open]');
    header.classList.toggle('is-hidden', !menuOpen && y > 400 && y > lastY + 2);
    if (y < lastY - 2) header.classList.remove('is-hidden');
    html.toggleAttribute('data-header-hidden', header.classList.contains('is-hidden'));
    lastY = y;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
}

/* ── Dialog helpers (native <dialog> = focus trap + Esc) ── */
function wireDialog(dialog: HTMLDialogElement | null, openSel: string, closeSel: string) {
  if (!dialog) return { open: () => {}, close: () => {} };
  let opener: HTMLElement | null = null;
  const open = (from?: HTMLElement | null) => {
    if (dialog.open) return;
    opener = from ?? (document.activeElement as HTMLElement);
    dialog.showModal();
    html.style.overflow = 'hidden';
  };
  const close = () => { if (dialog.open) dialog.close(); };
  dialog.addEventListener('close', () => { html.style.overflow = ''; opener?.focus?.(); });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); }); // backdrop click
  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const o = t.closest<HTMLElement>(openSel);
    if (o) { e.preventDefault(); open(o); }
    if (t.closest(closeSel)) close();
  });
  return { open, close };
}

const menu = wireDialog(document.querySelector('[data-menu]'), '[data-menu-open]', '[data-menu-close]');
document.querySelectorAll('[data-menu] a').forEach((a) => a.addEventListener('click', () => menu.close()));
addEventListener('resize', () => { if (innerWidth >= 1000) menu.close(); });

const bagDialog = document.querySelector<HTMLDialogElement>('[data-bag]');
const drawer = wireDialog(bagDialog, '[data-bag-open]', '[data-bag-close]');
document.querySelector('[data-bag-close-link]')?.addEventListener('click', () => drawer.close());

/* ── Bag rendering ── */
const tpl = document.getElementById('bag-line-tpl') as HTMLTemplateElement | null;

export function renderBag() {
  const lines = bag.lines();
  const count = bag.count();
  const subtotal = bag.subtotal();

  document.querySelectorAll<HTMLElement>('[data-bag-count]').forEach((el) => {
    el.textContent = String(count);
    el.hidden = count === 0;
  });
  document.querySelectorAll<HTMLElement>('[data-bag-sr]').forEach((el) => {
    el.textContent = count ? `Open bag, ${count} item${count === 1 ? '' : 's'}` : 'Open bag, empty';
  });

  if (!bagDialog || !tpl) return;
  bagDialog.dataset.empty = String(count === 0);
  const head = bagDialog.querySelector('[data-bag-headcount]');
  if (head) head.textContent = count ? `(${count})` : '';
  const sub = bagDialog.querySelector('[data-bag-subtotal]');
  if (sub) sub.textContent = money(subtotal);
  bagDialog.querySelectorAll<HTMLAnchorElement>('[data-checkout]').forEach((a) => (a.href = bag.checkoutUrl()));

  const ship = bagDialog.querySelector<HTMLElement>('[data-ship]');
  if (ship) {
    const th = Number(ship.dataset.threshold);
    const left = Math.max(0, th - subtotal);
    ship.querySelector('[data-ship-text]')!.textContent =
      count === 0 ? `Free shipping on orders over $${th}.` : left > 0 ? `You're ${money(left)} away from free shipping.` : 'Your order ships free.';
    (ship.querySelector('[data-ship-bar]') as HTMLElement).style.transform = `scaleX(${Math.min(1, subtotal / th)})`;
  }

  const list = bagDialog.querySelector('[data-bag-lines]')!;
  list.replaceChildren(
    ...lines.map((l) => {
      const node = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
      node.querySelectorAll<HTMLAnchorElement>('[data-l-link]').forEach((a) => (a.href = `/products/${l.handle}`));
      const img = node.querySelector<HTMLImageElement>('[data-l-img]')!;
      if (l.image) img.src = l.image; else img.remove();
      img.alt = `${l.title} bag`;
      node.querySelector('[data-l-title]')!.textContent = l.title;
      node.querySelector('[data-l-variant]')!.textContent = `${l.variantTitle} · Whole bean`;
      node.querySelector('[data-l-qty]')!.textContent = String(l.qty);
      node.querySelector('[data-l-price]')!.textContent = money(l.price * l.qty);
      node.querySelector('[data-l-dec]')!.addEventListener('click', () => bag.setQty(l.variantId, l.qty - 1));
      node.querySelector('[data-l-inc]')!.addEventListener('click', () => bag.setQty(l.variantId, l.qty + 1));
      node.querySelector('[data-l-remove]')!.addEventListener('click', () => bag.remove(l.variantId));
      node.querySelector('[data-l-dec]')!.setAttribute('aria-label', `Decrease quantity of ${l.title} ${l.variantTitle}`);
      node.querySelector('[data-l-inc]')!.setAttribute('aria-label', `Increase quantity of ${l.title} ${l.variantTitle}`);
      node.querySelector('[data-l-remove]')!.setAttribute('aria-label', `Remove ${l.title} ${l.variantTitle}`);
      return node;
    }),
  );
}

document.addEventListener('bag:change', () => renderBag());
document.addEventListener('bag:added', () => {
  document.querySelectorAll('[data-bag-count]').forEach((el) => {
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 400);
  });
  drawer.open();
});
renderBag();

/* ── Quick-add buttons anywhere: <button data-add='{"variantId":..}'> ── */
document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-add]');
  if (!btn) return;
  e.preventDefault();
  const line = JSON.parse(btn.dataset.add!);
  bag.add(line, 1);
  document.dispatchEvent(new CustomEvent('bag:added'));
});

/* ── Reveal on scroll ── */
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  html.classList.add('motion');
  // Elements fully clipped by clip-path never "intersect", so masked reveals are
  // observed through their parent element instead.
  const targets = new Map<Element, Element[]>();
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      (targets.get(en.target) ?? []).forEach((el) => el.classList.add('is-in'));
      targets.delete(en.target);
      io.unobserve(en.target);
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0 },
  );
  const observe = () => document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => {
    const t = el.dataset.reveal === 'mask' && el.parentElement ? el.parentElement : el;
    const list = targets.get(t) ?? [];
    if (!list.includes(el)) list.push(el);
    targets.set(t, list);
    io.observe(t);
  });
  observe();
  // Safety: anything already above the fold after load is revealed.
  addEventListener('load', () => setTimeout(observe, 50));
}
