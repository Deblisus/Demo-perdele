# Perdele Shop - Fan Courier & SmartBill Handoff

## Context
This project is a Next.js 16 (App Router) e-commerce store for curtains (perdele & draperii). 
We have completed Phase 1 (Checkout wizard, Netopia payments webhook, Resend emails) and Phase 2 (Product Catalog, Landing Page, PDP Configurator). 

The app uses:
- **Next.js 16.3.4** (Turbopack, Server Components by default)
- **Prisma** with SQLite (for now)
- **Zustand** for cart state
- **Tailwind CSS v4** & **shadcn/ui**

## 1. Fan Courier SelfAWB Sandbox Integration

### Current Status
We already have the boilerplate Fan Courier client implemented in `src/lib/integrations/fan-courier/client.ts`. It includes authentication, AWB generation (`createAwb`), label generation (`getAwbLabel`), tracking, and fetching localities/counties.

The checkout service (`src/services/checkout.service.ts`) currently attempts to call `fanCourierClient.createAwb()` asynchronously inside the Netopia IPN webhook (`src/app/api/webhooks/netopia/route.ts`) when an order is marked as `PAID`.

### What Needs to be Done (Your Task)
1. **Configure Sandbox Credentials**: Ensure the `.env` has the correct Fan Courier SelfAWB sandbox credentials:
   - `FAN_COURIER_CLIENT_ID`
   - `FAN_COURIER_USERNAME`
   - `FAN_COURIER_PASSWORD`
2. **Validate Integration**: Test the `createAwb` flow to ensure the payload matches Fan Courier API expectations. Check that the county/city naming conventions map correctly.
3. **Handle AWB Label Generation**: Currently, we create the AWB but don't download the PDF label. You need to use the `getAwbLabel` method to fetch the PDF and either:
   - Save it to the server (e.g., in a secure uploads folder)
   - Attach it to the order confirmation email sent to the store admin
   - Store the URL/path in the database (may require expanding the Prisma `Order` model)
4. **Implement Tracking**: The tracking URL is currently hardcoded in `sendShippingNotification` (`checkout.service.ts`). Verify if this URL works, or if we need to use the `trackAwb` method to expose a frontend tracking page (e.g., `/comanda/tracking/[awb]`).
5. **Dynamic Weight & Dimensions**: The weight and dimensions are currently hardcoded in `checkout.service.ts`. These need to be calculated based on the actual cart items (e.g., length of curtains ordered).

---

## 2. Platform Production Configuration Checklist

Before launching the platform to production, the following infrastructure and configuration steps are required:

- [ ] **Database Migration**: Switch Prisma from `SQLite` to a production-ready database like `PostgreSQL` or `MySQL`. This requires changing the `provider` in `schema.prisma` and migrating the data.
- [ ] **Environment Variables**:
  - `DATABASE_URL`: Update to production DB URL.
  - `NEXT_PUBLIC_APP_URL`: Set to the live domain (e.g., `https://perdeleshop.ro`).
- [ ] **Netopia Payments Live Mode**: 
  - Switch from Sandbox to Live API keys in Netopia dashboard.
  - Update `NETOPIA_API_KEY` and `NETOPIA_PUBLIC_KEY` / private key configurations.
  - Ensure the IPN Webhook URL is accessible to Netopia.
- [ ] **Email Domain Verification (Resend)**: 
  - Verify the production domain (e.g., `perdeleshop.ro`) in Resend to ensure emails land in the Inbox, not Spam.
  - Update `RESEND_API_KEY`.
- [ ] **Hosting Setup**: 
  - Deploy to Vercel (recommended for Next.js) or a VPS/Docker setup.
  - Configure caching rules (Turbopack + Next 16 caches) and configure proper ISR/cache invalidation for the product catalog.

---

## 3. Future Integration: SmartBill Invoicing

To implement automated SmartBill invoice generation in the future, you will need to prepare the following:

### SmartBill Prerequisites
- **SmartBill Account**: API access requires a paid SmartBill Cloud account.
- **API Credentials**: You will need the `CIF` (Company Tax ID) and the `API Token` generated from the SmartBill dashboard.

### Implementation Steps
1. **API Client**: Create a new integration module at `src/lib/integrations/smartbill/client.ts`. The SmartBill REST API endpoint for issuing invoices is `POST https://ws.smartbill.ro/SBORO/api/invoice`.
2. **Data Mapping**: 
   - You must map our `OrderItem` and shipping cost into SmartBill `products` array.
   - Separate VAT (TVA) logic depending on whether the company is VAT-registered.
   - Products should ideally have a matching SKU (or create them dynamically).
3. **Trigger Point**: The best time to generate the invoice is immediately after Netopia confirms the payment. Inside `src/app/api/webhooks/netopia/route.ts`, right after generating the Fan Courier AWB, call `smartbillClient.issueInvoice(order)`.
4. **Download & Send Invoice**: Similar to the Fan Courier AWB label, you will want to retrieve the PDF invoice from SmartBill and attach it to the `sendOrderConfirmation` email sent to the customer via Resend.
5. **Database Updates**: Add an `invoiceNumber` and `invoiceUrl` string field to the Prisma `Order` model to track issued invoices.
