import type { PrismaClient } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import type {
  IFavoriteRepository,
  FavoriteWithProduct,
} from "./favorite.repository";

export class PrismaFavoriteRepository implements IFavoriteRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return (ctx?.tx ?? this.client) as PrismaClient;
  }

  async toggle(
    userId: string,
    productId: string,
    ctx?: RepoContext,
  ): Promise<boolean> {
    // userId_productId 唯一约束,直接定位
    const existing = await this.db(ctx).favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      await this.db(ctx).favorite.delete({
        where: { userId_productId: { userId, productId } },
      });
      return false;
    }
    await this.db(ctx).favorite.create({
      data: { userId, productId, createdBy: ctx?.actorId },
    });
    return true;
  }

  async findByUser(
    userId: string,
    ctx?: RepoContext,
  ): Promise<FavoriteWithProduct[]> {
    return this.db(ctx).favorite.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
