import { PrismaClient } from "@/generated/prisma";


// Avoid multiple instances in development (Next.js hot reload)
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;