import { Prisma } from "@prisma/client";

/**
 * Map Prisma's unique-constraint failure onto the field the operator typed in,
 * so the form can pin the message to the offending input instead of showing a
 * bare "database error".
 */
export function uniqueViolation(
  error: unknown
): { error: string; fields: Record<string, string[]> } | null {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return null;
  }

  const target = error.meta?.target;
  const field = Array.isArray(target) ? String(target[0]) : String(target ?? "");

  if (field.includes("slug")) {
    return {
      error: "That slug is already taken.",
      fields: { slug: ["Another record already uses this slug"] },
    };
  }
  if (field.includes("sku")) {
    return {
      error: "That SKU is already taken.",
      fields: { sku: ["Another product already uses this SKU"] },
    };
  }
  return { error: "That value must be unique.", fields: {} };
}

/** Anything else: log the detail server-side, tell the operator the shape of it. */
export function genericError(error: unknown, context: string): { error: string } {
  console.error(`[Admin/${context}]`, error);
  return { error: "The database rejected the write." };
}

/** Prisma's "record not found" for an update or delete against a missing row. */
export function isMissingRecord(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2025" || error.code === "P2016")
  );
}
