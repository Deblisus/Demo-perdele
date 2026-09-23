# Design — Perdele online (shop)

The locked design system for the customer-facing shop (`src/app/(shop)`).
Every shop page reads this file before changing visuals. Extend or amend it
when the system needs to grow — do not restyle pages one by one.

The admin panel (`src/app/(admin)`) is a separate room with its own system
(Cobalt, scoped to `.admin-scope` in `src/app/admin.css`). Nothing here applies
to it, and nothing there applies to the shop.

## Genre
Editorial — a tailor's shop, not a SaaS page. Warm paper, serif display,
hairline rules instead of cards, ink buttons. Reference for *what* to show
(not how): perdeleacasa.ro — category-first navigation, price per linear
metre with the old price struck through, free-shipping threshold always
visible, grids grouped by type.

## Macrostructure family
- **Home:** Ecosystem Index — asymmetric split hero (statement + one tall
  photo), then rail-titled bands: Colecții (index list) → Recomandate acum
  (grid) → Cum măsori / Cum se prinde pe galerie (spec list + table).
- **Catalogue / category:** Catalogue — serif page title, collection tabs,
  one chip toolbar (opacity · colour dropdown · price · sort) that **sticks
  under the header** (`top: var(--header-h)`) for the length of the grid;
  on mobile it collapses to "Filtre" + sort and opens its panel in place.
  Uniform 4-up grid, text pagination.
- **Product page:** Split — gallery (sticky, thumbnails on the left edge) /
  numbered configurator (1 lățime · 2 înălțime · 3 manoperă) with a live
  total; description and specs side by side below.
- **Checkout:** text step line, one form column, sticky summary on paper-2.
  Visual layer only — step logic, validation and API payload are unchanged.

## Theme
Tokens live in `src/app/tokens.css` under the raw shadcn names, so every
`components/ui` primitive re-skins without a fork.

| Role | Token | Value |
| --- | --- | --- |
| Paper | `--background` | `oklch(0.978 0.006 85)` warm linen |
| Paper-2 | `--secondary` / `--muted` | `oklch(0.948 0.01 80)` |
| Ink | `--foreground` | `oklch(0.23 0.012 60)` warm charcoal |
| Ink-2 | `--muted-foreground` | `oklch(0.47 0.014 60)` |
| Rule | `--border` | `oklch(0.885 0.012 75)` |
| Primary action | `--primary` | `oklch(0.25 0.012 60)` (ink) |
| Accent | `--brand` | `oklch(0.47 0.13 25)` madder red |
| Focus | `--ring` | `oklch(0.35 0.012 60)` |
| Success | `--success` | `oklch(0.45 0.09 150)` |

Tailwind utilities: `bg-brand`, `text-brand`, `border-brand`, `text-success`,
`font-display`.

**Accent budget:** sale prices, discount marks, the active category mark,
the current checkout step, the "Reduceri" link, the cart count. On the ink
category band the accent uses `--brand-on-ink` (`oklch(0.8 0.1 30)`). Never a button fill, a
section background, or a focus ring (red focus reads as an error).

## Typography
- Display: **Newsreader**, weight 500, roman only (`--font-newsreader`,
  utility `font-display`). Page titles, section heads, wordmark, prices.
- Body/UI: **Montserrat** (`--font-montserrat`), 400/500/600.
- Mono: JetBrains Mono — order numbers only.
- Both families load `latin` + `latin-ext` so ă, ș, ț never fall back.
- Display tracking `-0.02em` at hero size, `tracking-tight` elsewhere.
- Hero: `clamp(2.5rem, 6vw, 4.75rem)`, ≤ 50 characters.
- Figures in price columns use `.tnum` (tabular numerals).
- No italic headings, no uppercase eyebrows over section titles.

## Spacing & shape
Tailwind's 4-pt scale. Sections are separated by `mt-20 lg:mt-28` and a
section head closes with a 1px ink rule (`border-foreground`); rows inside
use `border-border` hairlines. `--radius: 0.25rem` — tailored, not bubbly.
Container: `max-w-7xl px-4 lg:px-8`.

## Motion
Two primitives, nothing on scroll:
1. Product card crossfades to the second photo on hover (300 ms, opacity).
2. Category-row arrow nudges 4px right on hover (transform).
Easing `cubic-bezier(0.16, 1, 0.3, 1)`; `motion-reduce` disables both.
No `hover:scale-*`, no `transition-all` in shop components.

## Microinteractions stance
- Add to cart: one informational toast with "Mergi la coș"; no confetti.
- Filters apply immediately (no "Apply" except for the price pair) and
  reset pagination; `scroll: false` keeps the grid in place.
- Focus rings show instantly, ink colour, never animated.

## CTA voice
- Primary: solid ink, `h-12 rounded-sm px-7/8`, verb-first Romanian copy
  that names the next place ("Continuă spre livrare", "Vezi colecția").
- Secondary: an underlined text link, never a second boxed button
  ("← Înapoi la coș", "Cum măsor fereastra").

## Navigation & footer
- Nav: N6 masthead — issue line (free shipping · tailoring time · phone),
  centred serif wordmark, and the cart as the header's one solid ink button
  ("Coș" + count badge) on the right. Categories sit on a full-width **ink
  band** (h-11) beneath, paper text, madder underline on the current one.
  Sticky. Its height is `--header-h` in tokens.css (65px mobile, 124px
  desktop) — anything sticky below the header offsets by that token.
- Footer: Ft1 mast-headed — wordmark + tagline + contact in one band, then
  a single inline index of collections, then the legal line. Paper-2.

## Per-page allowances
- Home may use one photo in the hero and hand-built SVG diagrams.
- Product and category photos must show curtains (seed data, Unsplash);
  each product has two photos so the card can crossfade on hover.
- Catalogue, product and checkout pages: no decorative imagery.
- No invented numbers (years, customer counts, "până la X%" offers) unless
  the owner supplies them.

## What pages MUST share
Wordmark, the two fonts, the palette and accent budget, ink primary buttons
with text-link secondaries, hairline dividers, the section-head rule.

## What pages MAY differ on
Macrostructure within the family above; grid density; whether a section
head carries a right-aligned "Vezi toate" link.

## Exports

### tokens.css
See `src/app/tokens.css` (the source of truth; imported by `globals.css`).

### Tailwind v4 `@theme` (already wired in `globals.css`)
```css
@theme inline {
  --font-display: var(--font-newsreader);
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
  --color-success: var(--success);
}
```

### DTCG `tokens.json`
```json
{
  "color": {
    "paper":  { "$value": "oklch(0.978 0.006 85)", "$type": "color" },
    "paper2": { "$value": "oklch(0.948 0.01 80)",  "$type": "color" },
    "ink":    { "$value": "oklch(0.23 0.012 60)",  "$type": "color" },
    "ink2":   { "$value": "oklch(0.47 0.014 60)",  "$type": "color" },
    "rule":   { "$value": "oklch(0.885 0.012 75)", "$type": "color" },
    "accent": { "$value": "oklch(0.47 0.13 25)",   "$type": "color" },
    "focus":  { "$value": "oklch(0.35 0.012 60)",  "$type": "color" }
  },
  "font": {
    "display": { "$value": "Newsreader", "$type": "fontFamily" },
    "body":    { "$value": "Montserrat", "$type": "fontFamily" }
  },
  "radius": { "base": { "$value": "0.25rem", "$type": "dimension" } }
}
```
