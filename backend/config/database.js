const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) throw new Error("DATABASE_URL is not configured.");
const separator = rawUrl.includes("?") ? "&" : "?";
const connectionString = rawUrl.includes("sslmode=") ? rawUrl : `${rawUrl}${separator}uselibpqcompat=true&sslmode=require`;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

module.exports = prisma;
