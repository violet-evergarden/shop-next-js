import type { PrismaClient, Category } from "@prisma/client";
import type { RepoContext, TransactionClient } from "@/lib/repository";
import { prisma } from "@/lib/db";
import type { ICategoryRepository } from "./category.repository";

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return (ctx?.tx ?? this.client) as PrismaClient;
  }

  async findActive(ctx?: RepoContext): Promise<Category[]> {
    return this.db(ctx).category.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
  }
}
