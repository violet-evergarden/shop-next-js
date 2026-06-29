import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 配置:migrate/push 的连接 URL 从 schema 移到这里。
 * 运行时连接由 src/lib/db.ts 的 driver adapter 负责。
 */
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL 未配置");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
