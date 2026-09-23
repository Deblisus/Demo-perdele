import { db } from "@/lib/db";
import { roundPrice } from "@/lib/utils/currency";
import {
  dayKey,
  recentShopDays,
  startOfShopDay,
  startOfShopMonth,
} from "./time";

/**
 * Dashboard figures.
 *
 * Revenue counts an order once its payment is `PAID`, and attributes it to the
 * day it was *paid* rather than the day it was placed — a card that clears the
 * next morning belongs to the morning's takings.
 *
 * "Needs fulfilment" is the number the operator actually acts on: paid, not yet
 * shipped. It is deliberately not the same as "unpaid", which is money that may
 * never arrive; both are surfaced, separately.
 */

/** Orders sitting in the operator's queue: money in, parcel not out. */
const AWAITING_FULFILMENT = ["PAID", "PROCESSING"];

export type Overview = {
  totalOrders: number;
  revenueToday: number;
  ordersToday: number;
  revenueMonth: number;
  ordersMonth: number;
  awaitingFulfilment: number;
  unpaidOrders: number;
  outOfStock: number;
  totalProducts: number;
};

export async function getOverview(now = new Date()): Promise<Overview> {
  const startToday = startOfShopDay(now);
  const startMonth = startOfShopMonth(now);

  const [
    totalOrders,
    paidToday,
    paidThisMonth,
    awaitingFulfilment,
    unpaidOrders,
    outOfStock,
    totalProducts,
  ] = await Promise.all([
    db.order.count(),
    db.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { paymentStatus: "PAID", paidAt: { gte: startToday } },
    }),
    db.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { paymentStatus: "PAID", paidAt: { gte: startMonth } },
    }),
    db.order.count({
      where: { paymentStatus: "PAID", status: { in: AWAITING_FULFILMENT } },
    }),
    db.order.count({ where: { paymentStatus: { in: ["PENDING", "PROCESSING"] } } }),
    db.product.count({ where: { inStock: false } }),
    db.product.count(),
  ]);

  return {
    totalOrders,
    revenueToday: roundPrice(paidToday._sum.total ?? 0),
    ordersToday: paidToday._count,
    revenueMonth: roundPrice(paidThisMonth._sum.total ?? 0),
    ordersMonth: paidThisMonth._count,
    awaitingFulfilment,
    unpaidOrders,
    outOfStock,
    totalProducts,
  };
}

export type RevenueDay = {
  key: string;
  label: string;
  revenue: number;
  orders: number;
};

/**
 * Revenue per day for the trailing `days` window, with empty days present and
 * zeroed. A chart that silently drops quiet days compresses the axis and makes
 * a bad fortnight look like a busy one.
 */
export async function getRevenueSeries(
  days = 30,
  now = new Date()
): Promise<RevenueDay[]> {
  const window = recentShopDays(days, now);
  const from = window[0].start;

  const orders = await db.order.findMany({
    where: { paymentStatus: "PAID", paidAt: { gte: from } },
    select: { total: true, paidAt: true },
  });

  const buckets = new Map<string, { revenue: number; orders: number }>();
  for (const order of orders) {
    if (!order.paidAt) continue;
    const key = dayKey(order.paidAt);
    const bucket = buckets.get(key) ?? { revenue: 0, orders: 0 };
    bucket.revenue += order.total;
    bucket.orders += 1;
    buckets.set(key, bucket);
  }

  return window.map((day) => {
    const bucket = buckets.get(day.key);
    return {
      key: day.key,
      label: day.label,
      revenue: roundPrice(bucket?.revenue ?? 0),
      orders: bucket?.orders ?? 0,
    };
  });
}

/** Counts shown as badges on the rail. */
export async function getNavCounts(): Promise<{
  pendingOrders: number;
  lowStock: number;
}> {
  const [pendingOrders, lowStock] = await Promise.all([
    db.order.count({
      where: { paymentStatus: "PAID", status: { in: AWAITING_FULFILMENT } },
    }),
    db.product.count({ where: { inStock: false } }),
  ]);
  return { pendingOrders, lowStock };
}

/** The last `take` orders, newest first, for the overview table. */
export async function getRecentOrders(take = 10) {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      billingFirstName: true,
      billingLastName: true,
      billingEmail: true,
      total: true,
      status: true,
      paymentStatus: true,
      awbNumber: true,
    },
  });
}

/** Products that are out of stock, for the overview's attention list. */
export async function getOutOfStockProducts(take = 6) {
  return db.product.findMany({
    where: { inStock: false },
    orderBy: { updatedAt: "desc" },
    take,
    select: {
      id: true,
      name: true,
      sku: true,
      slug: true,
      pricePerUnit: true,
      pricingUnit: true,
      category: { select: { name: true } },
    },
  });
}
