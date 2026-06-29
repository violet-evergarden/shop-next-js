import type { PrismaClient } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import type { ICartRepository, CartWithItems } from "./cart.repository";
import type { AddCartItemInput } from "../domain/cart";

export class PrismaCartRepository implements ICartRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return ctx?.tx ?? this.client;
  }

  async findActiveCartByUserId(
    userId: string,
    ctx?: RepoContext,
  ): Promise<CartWithItems | null> {
    return this.db(ctx).cart.findUnique({
      where: { userId },
      include: { items: { include: { sku: true, product: true } } },
    });
  }

  async addItem(
    userId: string,
    data: AddCartItemInput,
    ctx?: RepoContext,
  ): Promise<CartWithItems> {
    // 确保用户有购物车(Cart↔User 一对一)
    const cart = await this.db(ctx).cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    // 同 SKU 累加数量(利用 cartId_skuId 唯一约束)
    await this.db(ctx).cartItem.upsert({
      where: { cartId_skuId: { cartId: cart.id, skuId: data.skuId } },
      create: {
        cartId: cart.id,
        skuId: data.skuId,
        productId: data.productId,
        quantity: data.quantity,
        selected: true,
      },
      update: { quantity: { increment: data.quantity } },
    });
    const updated = await this.findActiveCartByUserId(userId, ctx);
    if (!updated) throw new Error("购物车初始化失败");
    return updated;
  }

  async setItemQuantity(
    userId: string,
    itemId: string,
    quantity: number,
    ctx?: RepoContext,
  ): Promise<void> {
    // 通过 cart.userId 过滤,确保只能改自己的购物车项
    if (quantity <= 0) {
      await this.db(ctx).cartItem.deleteMany({
        where: { id: itemId, cart: { userId } },
      });
      return;
    }
    await this.db(ctx).cartItem.updateMany({
      where: { id: itemId, cart: { userId } },
      data: { quantity },
    });
  }

  async removeItem(
    userId: string,
    itemId: string,
    ctx?: RepoContext,
  ): Promise<void> {
    await this.db(ctx).cartItem.deleteMany({
      where: { id: itemId, cart: { userId } },
    });
  }

  async removeItems(itemIds: string[], ctx?: RepoContext): Promise<void> {
    if (itemIds.length === 0) return;
    await this.db(ctx).cartItem.deleteMany({
      where: { id: { in: itemIds } },
    });
  }
}
