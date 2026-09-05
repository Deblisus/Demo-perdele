import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient instance.
 *
 * In development, Next.js hot-reloading creates new module instances on every
 * change. Storing the client on `globalThis` prevents opening excessive
 * database connections.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
