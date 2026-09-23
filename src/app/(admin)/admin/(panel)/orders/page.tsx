import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { findOrders, ORDERS_PER_PAGE, parseOrderQuery } from "@/lib/admin/orders";
import { dateTimeLabel } from "@/lib/admin/time";
import {
  FULFILMENT_FILTER_OPTIONS,
  PAYMENT_FILTER_OPTIONS,
} from "@/lib/admin/labels";
import { formatRON } from "@/lib/utils/currency";
import {
  FilterDate,
  FilterSelect,
  FilterShell,
  ResetFilters,
  SearchField,
} from "@/components/admin/FilterBar";
import { EmptyState, PageHead } from "@/components/admin/primitives";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import type { OrderRowView } from "@/components/admin/orders/types";

export const dynamic = "force-dynamic";

const FILTER_KEYS = ["q", "payment", "fulfilment", "from", "to"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = parseOrderQuery(params);
  const { rows, total, paidTotal, pages } = await findOrders(query);

  // Dates are formatted here, on the server, in shop time — see types.ts.
  const orders: OrderRowView[] = rows.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    placedAt: dateTimeLabel(order.createdAt),
    paidAt: order.paidAt ? dateTimeLabel(order.paidAt) : null,
    shippedAt: order.shippedAt ? dateTimeLabel(order.shippedAt) : null,
    customerName: `${order.billingFirstName} ${order.billingLastName}`,
    email: order.billingEmail,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    status: order.status,
    awbNumber: order.awbNumber,
    awbCost: order.awbCost,
    netopiaNtpId: order.netopiaNtpId,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      widthMeters: item.widthMeters,
      heightCm: item.heightCm,
      tailoringType: item.tailoringType,
      tailoringCost: item.tailoringCost,
    })),
    timeline: order.statusHistory.map((entry) => ({
      id: entry.id,
      status: entry.status,
      note: entry.note,
      at: dateTimeLabel(entry.createdAt),
    })),
    billing: {
      name: `${order.billingFirstName} ${order.billingLastName}`,
      phone: order.billingPhone,
      email: order.billingEmail,
      address: order.billingAddress,
      city: order.billingCity,
      county: order.billingCounty,
      zipCode: order.billingZipCode,
    },
    shipping: {
      name: `${order.shippingFirstName} ${order.shippingLastName}`,
      phone: order.shippingPhone,
      address: order.shippingAddress,
      city: order.shippingCity,
      county: order.shippingCounty,
      zipCode: order.shippingZipCode,
    },
  }));

  const firstRow = total === 0 ? 0 : (query.page - 1) * ORDERS_PER_PAGE + 1;
  const lastRow = Math.min(query.page * ORDERS_PER_PAGE, total);

  return (
    <div className="mx-auto max-w-[88rem]">
      <PageHead
        eyebrow="Operations"
        title="Orders"
        lede="Every order the checkout has written, paid or not. Open a row for its items, addresses and timeline."
      />

      <FilterShell className="mb-4">
        <SearchField
          placeholder="Order number, email, name or AWB"
          className="min-w-[14rem] flex-1"
        />
        <FilterSelect
          paramKey="payment"
          label="Payment"
          options={PAYMENT_FILTER_OPTIONS}
          className="w-[10rem]"
        />
        <FilterSelect
          paramKey="fulfilment"
          label="Stage"
          options={FULFILMENT_FILTER_OPTIONS}
          className="w-[11rem]"
        />
        <FilterDate paramKey="from" label="From" />
        <FilterDate paramKey="to" label="To" />
        <ResetFilters keys={FILTER_KEYS} />
      </FilterShell>

      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
        <p className="readout">
          {total === 0
            ? "No matching orders"
            : `${firstRow}–${lastRow} of ${total}`}
        </p>
        <p className="readout">
          Paid in this view ·{" "}
          <span className="machine text-foreground">
            {formatRON(paidTotal)}
          </span>
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Nothing matches these filters"
          hint="Widen the date range, clear the payment filter, or search by a different order number."
        />
      ) : (
        <>
          <OrdersTable orders={orders} sort={query.sort} dir={query.dir} />
          <Pagination
            page={query.page}
            pages={pages}
            params={params}
          />
        </>
      )}
    </div>
  );
}

function Pagination({
  page,
  pages,
  params,
}: {
  page: number;
  pages: number;
  params: Record<string, string | string[] | undefined>;
}) {
  if (pages <= 1) return null;

  const href = (target: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "page") continue;
      const single = Array.isArray(value) ? value[0] : value;
      if (single) next.set(key, single);
    }
    if (target > 1) next.set("page", String(target));
    const query = next.toString();
    return query ? `/admin/orders?${query}` : "/admin/orders";
  };

  const linkClass =
    "inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted";
  const disabledClass =
    "inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--rule)] px-2.5 text-[0.8rem] font-medium text-muted-foreground opacity-50";

  return (
    <nav
      className="mt-4 flex items-center justify-between gap-3"
      aria-label="Orders pagination"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkClass} rel="prev">
          <ChevronLeft className="size-3.5" aria-hidden />
          Previous
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden>
          <ChevronLeft className="size-3.5" />
          Previous
        </span>
      )}

      <span className="readout">
        Page {page} of {pages}
      </span>

      {page < pages ? (
        <Link href={href(page + 1)} className={linkClass} rel="next">
          Next
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden>
          Next
          <ChevronRight className="size-3.5" />
        </span>
      )}
    </nav>
  );
}
