import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Supabase's shared pooler needs an explicit encrypted connection mode.
const databaseUrl = process.env.DATABASE_URL;
const secureDatabaseUrl = databaseUrl && !databaseUrl.includes("sslmode=")
  ? `${databaseUrl}${databaseUrl.includes("?") ? "&" : "?"}uselibpqcompat=true&sslmode=require`
  : databaseUrl;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
if (!secureDatabaseUrl) throw new Error("DATABASE_URL is not configured.");
const adapter = new PrismaPg({ connectionString: secureDatabaseUrl });
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
