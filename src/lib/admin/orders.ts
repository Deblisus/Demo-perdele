import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { startOfShopDay } from "./time";

export const ORDERS_PER_PAGE = 25;

export const SORT_FIELDS = ["date", "total", "order", "customer"] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const FULFILMENT_FILTERS = [
  "all",
  "to_pack",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type FulfilmentFilter = (typeof FULFILMENT_FILTERS)[number];

export type OrderQuery = {
  q: string;
  payment: string;
  fulfilment: FulfilmentFilter;
  from: string;
  to: string;
  sort: SortField;
  dir: "asc" | "desc";
  page: number;
};

/** Parse and clamp the URL's search params into a query we trust. */
export function parseOrderQuery(
  params: Record<string, string | string[] | undefined>
): OrderQuery {
  const single = (key: string): string => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  };

  const sortRaw = single("sort") as SortField;
  const fulfilmentRaw = single("fulfilment") as FulfilmentFilter;
  const page = Number.parseInt(single("page"), 10);

  return {
    q: single("q").slice(0, 120),
    payment: single("payment").toUpperCase(),
    fulfilment: FULFILMENT_FILTERS.includes(fulfilmentRaw)
      ? fulfilmentRaw
      : "all",
    from: /^\d{4}-\d{2}-\d{2}$/.test(single("from")) ? single("from") : "",
    to: /^\d{4}-\d{2}-\d{2}$/.test(single("to")) ? single("to") : "",
    sort: SORT_FIELDS.includes(sortRaw) ? sortRaw : "date",
    dir: single("dir") === "asc" ? "asc" : "desc",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

function buildWhere(query: OrderQuery): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};
  const and: Prisma.OrderWhereInput[] = [];

  if (query.q) {
    // SQLite's LIKE is case-insensitive for ASCII, which covers order numbers
    // and email addresses. Prisma's `mode: "insensitive"` is a PostgreSQL-only
    // feature, so names containing Romanian diacritics still match case-
    // sensitively here — worth revisiting at the Postgres migration.
    and.push({
      OR: [
        { orderNumber: { contains: query.q } },
        { billingEmail: { contains: query.q } },
        { billingFirstName: { contains: query.q } },
        { billingLastName: { contains: query.q } },
        { awbNumber: { contains: query.q } },
      ],
    });
  }

  if (query.payment) {
    and.push({ paymentStatus: query.payment });
  }

  switch (query.fulfilment) {
    case "to_pack":
      and.push({ paymentStatus: "PAID", status: { in: ["PAID", "PROCESSING"] } });
      break;
    case "shipped":
      and.push({ status: "SHIPPED" });
      break;
    case "delivered":
      and.push({ status: "DELIVERED" });
      break;
    case "cancelled":
      and.push({ status: { in: ["CANCELLED", "REFUNDED"] } });
      break;
    default:
      break;
  }

  if (query.from) {
    and.push({ createdAt: { gte: shopDayBoundary(query.from) } });
  }
  if (query.to) {
    // `to` is inclusive of the whole day, so the boundary is the start of the
    // *next* day — otherwise picking today as the end date returns nothing.
    const end = shopDayBoundary(query.to);
    and.push({ createdAt: { lt: new Date(end.getTime() + 86_400_000) } });
  }

  if (and.length > 0) where.AND = and;
  return where;
}

/** `YYYY-MM-DD` (as typed into a date input) → the instant that shop day starts. */
function shopDayBoundary(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return startOfShopDay(new Date(Date.UTC(year, month - 1, day, 12)));
}

function buildOrderBy(query: OrderQuery): Prisma.OrderOrderByWithRelationInput[] {
  switch (query.sort) {
    case "total":
      return [{ total: query.dir }, { createdAt: "desc" }];
    case "order":
      return [{ orderNumber: query.dir }];
    case "customer":
      return [
        { billingLastName: query.dir },
        { billingFirstName: query.dir },
        { createdAt: "desc" },
      ];
    default:
      return [{ createdAt: query.dir }];
  }
}

/**
 * One page of orders plus the totals shown above the table.
 *
 * Line items and the status timeline are included up front: the table's rows
 * expand in place, and fetching each order's detail on expand would turn a
 * quick scan through ten orders into ten round trips.
 */
export async function findOrders(query: OrderQuery) {
  const where = buildWhere(query);

  const [rows, total, sum] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: buildOrderBy(query),
      skip: (query.page - 1) * ORDERS_PER_PAGE,
      take: ORDERS_PER_PAGE,
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    }),
    db.order.count({ where }),
    db.order.aggregate({
      where: { ...where, paymentStatus: "PAID" },
      _sum: { total: true },
    }),
  ]);

  return {
    rows,
    total,
    paidTotal: sum._sum.total ?? 0,
    pages: Math.max(1, Math.ceil(total / ORDERS_PER_PAGE)),
  };
}

export type AdminOrder = Awaited<ReturnType<typeof findOrders>>["rows"][number];
