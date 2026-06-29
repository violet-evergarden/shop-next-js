import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PrismaProductRepository } from "./prisma-product.repository";
import type { IProductRepository } from "./product.repository";

export type { IProductRepository };

/**
 * 创建商品仓储实例。
 * 默认用全局 Prisma 单例;测试时传入 mock client 即可隔离数据库。
 */
export function createProductRepository(
  client: PrismaClient = prisma,
): IProductRepository {
  return new PrismaProductRepository(client);
}
