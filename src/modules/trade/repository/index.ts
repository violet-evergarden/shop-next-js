import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PrismaCartRepository } from "./prisma-cart.repository";
import { PrismaOrderRepository } from "./prisma-order.repository";
import type { ICartRepository, CartWithItems, CartLine } from "./cart.repository";
import type {
  IOrderRepository,
  OrderWithItems,
  OrderQueryInput,
} from "./order.repository";

export type {
  ICartRepository,
  IOrderRepository,
  CartWithItems,
  CartLine,
  OrderWithItems,
  OrderQueryInput,
};

export function createCartRepository(
  client: PrismaClient = prisma,
): ICartRepository {
  return new PrismaCartRepository(client);
}

export function createOrderRepository(
  client: PrismaClient = prisma,
): IOrderRepository {
  return new PrismaOrderRepository(client);
}
