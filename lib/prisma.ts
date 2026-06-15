import { PrismaClient } from "@prisma/client"

// Reuse a single PrismaClient across hot reloads in development and across
// invocations in serverless environments to avoid exhausting database
// connections (a new client per reload/invocation opens a new pool).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
