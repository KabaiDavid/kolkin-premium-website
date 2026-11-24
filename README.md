# Kølkin Coffee — website

A fast, static, art-directed storefront for [Kølkin Coffee](https://kolkin.coffee) (New Albany, IN).
Built with [Astro](https://astro.build). **Shopify remains the commerce backend**: products, prices,
inventory, checkout, payments, shipping, taxes and subscriptions are all handled by the existing
Shopify store (`kolkin-coffee.myshopify.com`).

## How commerce works

- At build time `scripts/sync-products.mjs` pulls the live catalog from `https://kolkin.coffee/products.json`
  (names, variants, prices, availability, specs) into `src/data/products.snapshot.json`.
  If Shopify can't be reached, the committed snapshot is used.
- The bag is stored in the browser. **Checkout** hands the bag to Shopify with a
  [cart permalink](https://shopify.dev/docs/apps/build/checkout/create-cart-permalinks)
  (`https://kolkin.coffee/cart/{variantId}:{qty},…`), which opens Shopify's own secure checkout.
- Wholesale, contact and newsletter forms post to the Shopify store's built-in contact/customer forms,
  exactly like the original site.
- Subscribe & Save (Appstle) is set up on the Shopify product page; the site links to it.
- **Rebuild after changing products or prices in Shopify** so the site's snapshot updates
  (on Cloudflare Pages: *Deployments → Retry deployment*, or set up a deploy hook).

> If the storefront domain changes, update `SHOP_DOMAIN` in `src/data/site.ts`.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # syncs products, then builds to ./dist
npm run preview
```

## Deploy — Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick this repository and branch.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22`
4. **Save and Deploy.**

`public/_redirects` keeps the old Shopify page URLs (e.g. `/pages/kolkin-wholesale`) working, and
`public/_headers` sets caching and security headers.

### Before pointing kolkin.coffee at this site

`kolkin.coffee` currently points at Shopify, and checkout links use it. Before moving the root domain
to Cloudflare Pages, give Shopify its own subdomain (e.g. `shop.kolkin.coffee`) in Shopify → Settings →
Domains, then set `SHOP_DOMAIN` to that address and redeploy.

## Content sources

All business facts, product data, menu prices, wholesale terms and the journal article come from the
live kolkin.coffee site (audited November 2026). Photography is the brand's own; the hero texture is
their river photograph with a colour grade baked in (`public/textures`).

Fonts: Newsreader and Archivo (SIL OFL), subset by `scripts/subset-fonts.py`.
