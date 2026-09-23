import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getOutOfStockProducts,
  getOverview,
  getRecentOrders,
  getRevenueSeries,
} from "@/lib/admin/metrics";
import { dateTimeLabel } from "@/lib/admin/time";
import { formatRON } from "@/lib/utils/currency";
import { RevenueChart } from "@/components/admin/RevenueChart";
import {
  EmptyState,
  Figure,
  FigureRow,
  FulfilmentChip,
  Money,
  Nil,
  PageHead,
  PaymentChip,
  Section,
} from "@/components/admin/primitives";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [overview, revenue, recentOrders, outOfStock] = await Promise.all([
    getOverview(),
    getRevenueSeries(30),
    getRecentOrders(10),
    getOutOfStockProducts(6),
  ]);

  return (
    <div className="mx-auto max-w-[80rem]">
      <PageHead
        eyebrow="Operations"
        title="Overview"
        lede="Everything waiting on you, and what the shop took in. Revenue counts an order from the moment its payment clears."
        actions={
          <Link
            href="/admin/orders?fulfilment=to_pack"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Orders to pack
            <ArrowRight aria-hidden />
          </Link>
        }
      />

      <FigureRow>
        <Figure
          label="Revenue today"
          value={formatRON(overview.revenueToday)}
          qualifier={`${overview.ordersToday} paid ${overview.ordersToday === 1 ? "order" : "orders"}`}
          emphasis
        />
        <Figure
          label="Revenue this month"
          value={formatRON(overview.revenueMonth)}
          qualifier={`${overview.ordersMonth} paid ${overview.ordersMonth === 1 ? "order" : "orders"}`}
          emphasis
        />
        <Figure
          label="Orders to pack"
          value={String(overview.awaitingFulfilment)}
          tone={overview.awaitingFulfilment > 0 ? "warn" : "neutral"}
          qualifier="Paid, not yet shipped"
        />
        <Figure
          label="Unpaid orders"
          value={String(overview.unpaidOrders)}
          qualifier="Awaiting or processing payment"
        />
        <Figure
          label="Out of stock"
          value={`${overview.outOfStock} / ${overview.totalProducts}`}
          tone={overview.outOfStock > 0 ? "warn" : "neutral"}
          qualifier="Products marked unavailable"
        />
      </FigureRow>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Section
          label="Revenue · last 30 days"
          description="Paid orders only, bucketed by the day payment cleared, in shop time."
          className="lg:col-span-2"
        >
          <RevenueChart days={revenue} />
        </Section>

        <Section
          label="Needs attention"
          description="Products the storefront is currently hiding from buyers."
        >
          {outOfStock.length === 0 ? (
            <EmptyState
              title="Everything is in stock"
              hint="No product is currently marked unavailable."
            />
          ) : (
            <ul className="border-t border-[var(--rule-strong)]">
              {outOfStock.map((product) => (
                <li
                  key={product.id}
                  className="flex items-baseline justify-between gap-3 border-b border-[var(--rule)] py-2.5"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/products?q=${encodeURIComponent(product.name)}`}
                      className="block truncate text-[0.8125rem] hover:text-primary hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                      {product.category.name}
                      {product.sku ? (
                        <span className="machine"> · {product.sku}</span>
                      ) : null}
                    </p>
                  </div>
                  <Money
                    value={product.pricePerUnit}
                    muted
                    className="shrink-0 text-[0.75rem]"
                  />
                </li>
              ))}
            </ul>
          )}

          <p className="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground">
            The catalog tracks stock as available / unavailable, not as a
            quantity — so this is a count of hidden products, not a reorder
            threshold.
          </p>
        </Section>
      </div>

      <Section
        label="Recent orders"
        description="The last ten, newest first."
        className="mt-8"
        actions={
          <Link
            href="/admin/orders"
            className="readout inline-flex items-center gap-1.5 rounded-sm px-1.5 py-1 transition-colors hover:bg-secondary hover:text-foreground"
          >
            All orders
            <ArrowRight className="size-3" aria-hidden />
          </Link>
        }
      >
        {recentOrders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            hint="Orders appear here the moment checkout writes them, before payment is confirmed."
          />
        ) : (
          <div className="scroll-x">
            <table className="ledger min-w-[46rem]">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Placed</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Payment</th>
                  <th scope="col">Fulfilment</th>
                  <th scope="col">AWB</th>
                  <th scope="col" className="text-right!">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="row-live">
                    <td>
                      <Link
                        href={`/admin/orders?q=${order.orderNumber}`}
                        className="machine text-[0.8125rem] hover:text-primary hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="machine text-[0.75rem] whitespace-nowrap text-muted-foreground">
                      {dateTimeLabel(order.createdAt)}
                    </td>
                    <td className="max-w-[16rem]">
                      <p className="truncate text-[0.8125rem]">
                        {order.billingFirstName} {order.billingLastName}
                      </p>
                      <p className="truncate text-[0.75rem] text-muted-foreground">
                        {order.billingEmail}
                      </p>
                    </td>
                    <td>
                      <PaymentChip status={order.paymentStatus} />
                    </td>
                    <td>
                      <FulfilmentChip status={order.status} />
                    </td>
                    <td className="machine text-[0.75rem]">
                      {order.awbNumber ?? <Nil />}
                    </td>
                    <td className="text-right">
                      <Money value={order.total} className="text-[0.8125rem]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
