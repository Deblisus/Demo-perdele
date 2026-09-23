"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRON } from "@/lib/utils/currency";
import { useQueryParams } from "@/components/admin/FilterBar";
import {
  FulfilmentChip,
  Money,
  Nil,
  PaymentChip,
} from "@/components/admin/primitives";
import { TAILORING_LABELS } from "@/lib/admin/labels";
import { OrderActions } from "./OrderActions";
import type { AddressView, OrderRowView } from "./types";

type SortField = "date" | "total" | "order" | "customer";

const COLUMNS: Array<{
  key: string;
  label: string;
  sort?: SortField;
  align?: "right";
  className?: string;
}> = [
  { key: "order", label: "Order #", sort: "order" },
  { key: "date", label: "Date", sort: "date" },
  { key: "customer", label: "Customer", sort: "customer" },
  { key: "payment", label: "Payment" },
  { key: "awb", label: "AWB" },
  { key: "fulfilment", label: "Fulfilment" },
  { key: "total", label: "Total", sort: "total", align: "right" },
];

export function OrdersTable({
  orders,
  sort,
  dir,
}: {
  orders: OrderRowView[];
  sort: SortField;
  dir: "asc" | "desc";
}) {
  const setParams = useQueryParams();
  const [openId, setOpenId] = useState<string | null>(null);

  function toggleSort(field: SortField) {
    // Re-clicking the active column flips direction; a new column starts on the
    // direction that is useful first — newest dates and biggest totals.
    const nextDir = sort === field && dir === "desc" ? "asc" : "desc";
    setParams({ sort: field, dir: nextDir });
  }

  return (
    <div className="scroll-x">
      <table className="ledger min-w-[56rem]">
        <caption className="sr-only">
          Orders. Activate a row to see its items, addresses and timeline.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="w-8">
              <span className="sr-only">Expand</span>
            </th>
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(column.align === "right" && "text-right!")}
                aria-sort={
                  column.sort && sort === column.sort
                    ? dir === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                {column.sort ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(column.sort!)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-sm px-1 py-0.5 -mx-1 transition-colors hover:text-foreground",
                      sort === column.sort && "text-foreground"
                    )}
                  >
                    {column.label}
                    {sort === column.sort ? (
                      dir === "asc" ? (
                        <ChevronUp className="size-3" aria-hidden />
                      ) : (
                        <ChevronDown className="size-3" aria-hidden />
                      )
                    ) : (
                      <ChevronsUpDown
                        className="size-3 opacity-40"
                        aria-hidden
                      />
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const open = openId === order.id;
            return (
              <OrderRow
                key={order.id}
                order={order}
                open={open}
                onToggle={() => setOpenId(open ? null : order.id)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OrderRow({
  order,
  open,
  onToggle,
}: {
  order: OrderRowView;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `order-panel-${order.id}`;

  return (
    <>
      <tr
        className="row-live cursor-pointer"
        data-open={open}
        onClick={onToggle}
      >
        <td className="pr-0!">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`${open ? "Collapse" : "Expand"} ${order.orderNumber}`}
            onClick={(event) => {
              // The whole row is the target; this stops the click counting twice.
              event.stopPropagation();
              onToggle();
            }}
            className="flex size-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-150",
                open && "rotate-180"
              )}
              aria-hidden
            />
          </button>
        </td>
        <td className="machine text-[0.8125rem] whitespace-nowrap">
          {order.orderNumber}
        </td>
        <td className="machine text-[0.75rem] whitespace-nowrap text-muted-foreground">
          {order.placedAt}
        </td>
        <td className="max-w-[18rem]">
          <p className="truncate text-[0.8125rem]">{order.customerName}</p>
          <p className="truncate text-[0.75rem] text-muted-foreground">
            {order.email}
          </p>
        </td>
        <td>
          <PaymentChip status={order.paymentStatus} />
        </td>
        <td className="machine text-[0.75rem] whitespace-nowrap">
          {order.awbNumber ?? <Nil />}
        </td>
        <td>
          <FulfilmentChip status={order.status} />
        </td>
        <td className="text-right">
          <Money value={order.total} className="text-[0.8125rem]" />
        </td>
      </tr>

      {open ? (
        <tr data-open="true">
          <td colSpan={8} className="p-0!" id={panelId}>
            <OrderDetail order={order} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function OrderDetail({ order }: { order: OrderRowView }) {
  return (
    <div className="border-t border-[var(--rule)] bg-background px-4 py-5">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <section>
            <h3 className="readout mb-2">Items</h3>
            <div className="scroll-x">
              <table className="ledger min-w-[32rem]">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Spec</th>
                    <th scope="col" className="text-right!">
                      Qty
                    </th>
                    <th scope="col" className="text-right!">
                      Unit
                    </th>
                    <th scope="col" className="text-right!">
                      Line
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="max-w-[18rem]">
                        <p className="truncate text-[0.8125rem]">
                          {item.productName}
                        </p>
                        {item.productSku ? (
                          <p className="machine truncate text-[0.6875rem] text-muted-foreground">
                            {item.productSku}
                          </p>
                        ) : null}
                      </td>
                      <td className="text-[0.75rem] text-muted-foreground">
                        {describeSpec(item)}
                      </td>
                      <td className="machine text-right text-[0.8125rem]">
                        {item.quantity}
                      </td>
                      <td className="machine text-right text-[0.75rem] text-muted-foreground">
                        {formatRON(item.unitPrice)}
                      </td>
                      <td className="machine text-right text-[0.8125rem]">
                        {formatRON(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="readout text-right!">
                      Subtotal
                    </td>
                    <td className="machine text-right text-[0.8125rem]">
                      {formatRON(order.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="readout text-right!">
                      Shipping
                    </td>
                    <td className="machine text-right text-[0.8125rem]">
                      {order.shippingCost === 0
                        ? "free"
                        : formatRON(order.shippingCost)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="readout text-right! text-foreground!">
                      Total
                    </td>
                    <td className="machine text-right text-[0.875rem] font-medium">
                      {formatRON(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section>
            <h3 className="readout mb-2">Actions</h3>
            <OrderActions order={order} />
          </section>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <AddressBlock label="Shipping address" address={order.shipping} />
            <AddressBlock label="Billing address" address={order.billing} />
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          <section>
            <h3 className="readout mb-2">Payment</h3>
            <dl className="space-y-1.5 border-t border-[var(--rule)] pt-2 text-[0.8125rem]">
              <Row term="Method" value={order.paymentMethod} />
              <Row term="Paid at" value={order.paidAt ?? "—"} mono />
              <Row
                term="Netopia ID"
                value={order.netopiaNtpId ?? "—"}
                mono
              />
              <Row term="Shipped at" value={order.shippedAt ?? "—"} mono />
              <Row
                term="AWB cost"
                value={
                  order.awbCost !== null ? formatRON(order.awbCost) : "—"
                }
                mono
              />
            </dl>
          </section>

          <section>
            <h3 className="readout mb-2">Timeline</h3>
            {order.timeline.length === 0 ? (
              <p className="text-[0.8125rem] text-muted-foreground">
                No entries recorded.
              </p>
            ) : (
              <ol className="border-t border-[var(--rule)]">
                {order.timeline.map((entry) => (
                  <li
                    key={entry.id}
                    className="border-b border-[var(--rule)] py-2.5"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <FulfilmentChip status={entry.status} />
                      <span className="machine shrink-0 text-[0.6875rem] text-muted-foreground">
                        {entry.at}
                      </span>
                    </div>
                    {entry.note ? (
                      <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted-foreground">
                        {entry.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({
  term,
  value,
  mono = false,
}: {
  term: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{term}</dt>
      <dd className={cn("min-w-0 truncate text-right", mono && "machine text-[0.75rem]")}>
        {value}
      </dd>
    </div>
  );
}

function AddressBlock({
  label,
  address,
}: {
  label: string;
  address: AddressView;
}) {
  return (
    <section>
      <h3 className="readout mb-2">{label}</h3>
      <address className="border-t border-[var(--rule)] pt-2 text-[0.8125rem] leading-relaxed not-italic">
        <span className="block">{address.name}</span>
        <span className="block text-muted-foreground">{address.address}</span>
        <span className="block text-muted-foreground">
          {address.city}, {address.county}
          {address.zipCode ? ` ${address.zipCode}` : ""}
        </span>
        <span className="machine mt-1 block text-[0.75rem]">
          {address.phone}
        </span>
        {address.email ? (
          <span className="machine block text-[0.75rem]">{address.email}</span>
        ) : null}
      </address>
    </section>
  );
}

/** Curtains are cut to size, so the line's dimensions matter as much as the qty. */
function describeSpec(item: OrderRowView["items"][number]): string {
  const parts: string[] = [];
  if (item.widthMeters) parts.push(`${item.widthMeters} ml`);
  if (item.heightCm) parts.push(`H ${item.heightCm} cm`);
  if (item.tailoringType && item.tailoringType !== "none") {
    parts.push(TAILORING_LABELS[item.tailoringType] ?? item.tailoringType);
  }
  return parts.length > 0 ? parts.join(" · ") : "—";
}
