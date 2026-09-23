@AGENTS.md

# Perdele Shop — Project Context

## Tech Stack
- Next.js 16.3.4 (App Router, Turbopack, React 19)
- Tailwind CSS v4 with OKLCH color tokens
- shadcn/ui (base-nova style with @base-ui/react primitives, NOT radix)
- Prisma 5.22 with SQLite (will migrate to PostgreSQL for production)
- Zustand 5 for client state
- TypeScript 5, Zod 4, lucide-react icons
- Font: Montserrat (CSS variable `--font-montserrat`)

## Project Structure
```
src/
├── app/
│   ├── (shop)/          # Customer-facing shop routes
│   │   ├── produse/     # Product catalog & PDP
│   │   ├── categorie/   # Category pages
│   │   └── checkout/    # Checkout wizard
│   ├── api/             # API routes (checkout, webhooks, tracking)
│   └── layout.tsx       # Root layout (Header + Footer + Toaster)
├── components/
│   ├── ui/              # shadcn/ui primitives (button, card, input, dialog, sheet, tabs, etc.)
│   ├── layout/          # Header, Footer, AnnouncementBar, MobileMenu, CartIcon
│   ├── product/         # ProductCard, ProductGrid, ProductConfigurator, etc.
│   ├── landing/         # HeroSection, TrustBar, CategoryShowcase, etc.
│   └── checkout/        # Checkout wizard steps (DO NOT MODIFY)
├── lib/
│   ├── db.ts            # Prisma client singleton
│   ├── utils/           # currency.ts, cn() helper
│   ├── validation.ts    # Zod schemas, TailoringType, constants
│   ├── constants/       # tailoring.ts
│   ├── queries/         # products.ts (Prisma query helpers)
│   ├── integrations/    # netopia/, fan-courier/ API clients
│   └── email/           # Resend email client
├── services/            # order.service.ts, checkout.service.ts, shipping.service.ts
└── stores/              # cart.store.ts (Zustand)
prisma/
├── schema.prisma        # Database schema (Order, OrderItem, Product, Category, etc.)
└── seed.ts              # Seed script (30 products, 5 categories)
```

## Existing Prisma Models (in schema.prisma)
- Order, OrderItem, OrderStatusHistory (Phase 1 — checkout)
- Product, Category, ProductImage (Phase 2 — catalog)

## Critical Rules
1. This is Next.js 16 — `params` and `searchParams` are `Promise<...>`, must be `await`ed
2. Use `loading="eager"` on next/image, NOT the deprecated `priority` prop
3. shadcn components use `@base-ui/react` — do NOT use `asChild` prop (it doesn't exist)
4. Use `buttonVariants()` + `<Link>` instead of `<Button asChild><Link>` 
5. All customer-facing UI text is in ROMANIAN
6. Admin dashboard text should be in ENGLISH (for the store owner)
7. Import UI components from `@/components/ui/...`
8. Use `cn()` from `@/lib/utils` for conditional classes

## Design System
- Color tokens in `src/app/globals.css` using OKLCH
- Border radius: `--radius: 0.625rem`
- Use existing shadcn components where possible
- Admin pages should live under `src/app/(admin)/admin/...`
- Admin layout should be separate from the shop layout (sidebar navigation)
```