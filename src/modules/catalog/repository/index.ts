import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PrismaProductRepository } from "./prisma-product.repository";
import { PrismaInventoryRepository } from "./prisma-inventory.repository";
import { PrismaCategoryRepository } from "./prisma-category.repository";
import type { IProductRepository, ProductDetail } from "./product.repository";
import type { IInventoryRepository } from "./inventory.repository";
import type { ICategoryRepository } from "./category.repository";

export type {
  IProductRepository,
  IInventoryRepository,
  ICategoryRepository,
  ProductDetail,
};

export function createProductRepository(
  client: PrismaClient = prisma,
): IProductRepository {
  return new PrismaProductRepository(client);
}

export function createInventoryRepository(
  client: PrismaClient = prisma,
): IInventoryRepository {
  return new PrismaInventoryRepository(client);
}

export function createCategoryRepository(
  client: PrismaClient = prisma,
): ICategoryRepository {
  return new PrismaCategoryRepository(client);
}
