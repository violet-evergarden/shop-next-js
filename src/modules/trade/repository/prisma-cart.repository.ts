import type { PrismaClient } from "@prisma/client";
import type { RepoContext, TransactionClient } from "@/lib/repository";
import { prisma } from "@/lib/db";
import { ConflictError } from "@/lib/errors";
import type { ICartRepository, CartWithItems } from "./cart.repository";
import type { AddCartItemInput } from "../domain/cart";

export class PrismaCartRepository implements ICartRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return (ctx?.tx ?? this.client) as PrismaClient;
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
    // 校验 SKU 存在 + active + 归属正确 + 库存充足
    const sku = await this.db(ctx).productSku.findUnique({
      where: { id: data.skuId },
      include: { inventory: true },
    });
    if (!sku || !sku.isActive) {
      throw new ConflictError("规格不存在或已下架");
    }
    if (sku.productId !== data.productId) {
      throw new ConflictError("规格与商品不匹配");
    }
    const currentQty = await this.db(ctx).cartItem.findUnique({
      where: { cartId_skuId: { cartId: (await this.db(ctx).cart.findUnique({ where: { userId } }))!.id, skuId: data.skuId } },
    }).then((ci) => ci?.quantity ?? 0).catch(() => 0);
    const stock = sku.inventory?.quantity ?? 0;
    if (currentQty + data.quantity > stock) {
      throw new ConflictError(`库存不足(剩余 ${stock})`);
    }

    const cart = await this.db(ctx).cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
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
