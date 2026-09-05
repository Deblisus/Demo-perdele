# Project Handoff: Perdele Shop (Phase 2)

## 📌 Project Context
This is a job assignment project to build a web shop for curtains ("perdele și draperii"). 
- **Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4, shadcn/ui, Zustand, Zod, React Hook Form, Prisma (v5.22), SQLite.
- **Global Font:** Montserrat (configured via `next/font/google` in `layout.tsx`).

## ✅ Phase 1: Completed (Do NOT modify these unless necessary)
The entire checkout system is 100% complete and fully tested:
1. **Cart Store:** Zustand store (`src/stores/cart.store.ts`) handles complex curtain pricing (linear meters, tailoring types/costs, heights).
2. **Checkout UI:** A multi-step wizard (`src/app/(shop)/checkout`) using `react-hook-form` and Zod validation.
3. **Database Schema:** `Order`, `OrderItem`, `Customer`, and `OrderStatusHistory` are created. *(Note: `Product` schema does not exist yet!)*
4. **Integrations Built:**
   - **Netopia Payments:** Fully integrated (Start payment + Webhook/IPN validation via RS512 JWT). We are currently running in **Mock Mode** (returns local mock URL if `NETOPIA_API_KEY="your-api-key"`).
   - **Fan Courier:** Fully integrated. Generates AWB automatically on successful payment.
   - **Resend Email:** Fully integrated. Sends order confirmations & shipping updates with AWB tracking links.

## 🚀 Phase 2: Outstanding Tasks (Your Mission)

### 1. Database Schema Expansion
The database currently only has order-related tables. You need to expand `prisma/schema.prisma`:
- Add `Product`, `Category`, and maybe `ProductImage` or `ProductVariant` models.
- Curtains have specific properties: they are often sold by linear meter (`ml`) or piece (`buc`), have custom heights, and tailoring options. Ensure the `Product` model can store these pricing rules.
- Add a Prisma seed script to populate some dummy curtain categories and products so the catalog is testable.

### 2. Product Catalog
- **Goal:** Implement a beautiful, simple-to-use product catalog.
- **Inspiration:** 
  - `https://perdeleacasa.ro/draperii/draperii-catifea`
  - `https://outletperdele.ro/categorie-produs/reducere/`
- **Features needed:**
  - Product listing grid with filtering/sorting (by category, price).
  - Product detail page (PDP) where users can input their required linear meters, select tailoring type (rejansa, capse, etc.), input height, and see the price update dynamically.
  - The "Add to Cart" button should interface with the existing `useCartStore` (`addItem`).

### 3. Unique Landing Page
- **Goal:** Design a unique landing page to showcase the business, display best-selling products, and attract customers.
- Replace the current dummy dev page in `src/app/page.tsx` with this beautiful landing page.

### 4. SmartBill Integration (Optional / "If time allows")
- If the above is completed quickly, integrate SmartBill for automated invoice generation when an order is marked as `PAID`.

---
**Note to Agent:** Please run `npm run dev` to see the current state of the app. The global layout, UI components, and checkout process are completely dialed in. Focus your planning and execution strictly on the frontend design (Landing + Catalog) and the Product data layer.
