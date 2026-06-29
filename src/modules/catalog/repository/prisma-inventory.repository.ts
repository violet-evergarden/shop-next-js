import type { PrismaClient, Inventory } from "@prisma/client";
import type { RepoContext, TransactionClient } from "@/lib/repository";
import { prisma } from "@/lib/db";
import type { IInventoryRepository } from "./inventory.repository";

export class PrismaInventoryRepository implements IInventoryRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return (ctx?.tx ?? this.client) as PrismaClient;
  }

  async findBySkuId(skuId: string, ctx?: RepoContext): Promise<Inventory | null> {
    return this.db(ctx).inventory.findUnique({ where: { skuId } });
  }

  async decrementQuantity(
    skuId: string,
    needed: number,
    ctx?: RepoContext,
  ): Promise<boolean> {
    const result = await this.db(ctx).inventory.updateMany({
      where: { skuId, quantity: { gte: needed } },
      data: { quantity: { decrement: needed } },
    });
    return result.count > 0;
  }
}
