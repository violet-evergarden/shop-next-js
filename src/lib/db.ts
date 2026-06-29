import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client 单例
 *
 * Next.js 开发模式热重载会反复实例化模块,直接 new PrismaClient() 会
 * 导致连接数飙升。挂在 globalThis 上保证全进程唯一实例。
 *
 * 数据库引擎由构建期 build-schema.ts 决定,运行时这里无需感知是哪种库。
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
