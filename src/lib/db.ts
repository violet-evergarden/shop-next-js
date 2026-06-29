import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * 按 DATABASE_PROVIDER 选择 driver adapter 构造 PrismaClient。
 * Prisma 7 必须显式传 adapter(url 不再在 schema 里)。
 */
function createAdapter() {
  const provider = process.env.DATABASE_PROVIDER ?? "postgresql";
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL 未配置");

  if (provider === "postgresql") {
    return new PrismaPg({ connectionString: url });
  }
  if (provider === "mysql") {
    return new PrismaMariaDb(url);
  }
  if (provider === "sqlite") {
    return new PrismaBetterSqlite3({ url });
  }
  throw new Error(`不支持的 DATABASE_PROVIDER: ${provider}`);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: createAdapter(),
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
