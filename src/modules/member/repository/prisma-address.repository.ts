import type { PrismaClient, Address } from "@prisma/client";
import type { RepoContext, TransactionClient } from "@/lib/repository";
import { prisma } from "@/lib/db";
import type { IAddressRepository } from "./address.repository";

export class PrismaAddressRepository implements IAddressRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return (ctx?.tx ?? this.client) as PrismaClient;
  }

  async findById(id: string, ctx?: RepoContext): Promise<Address | null> {
    return this.db(ctx).address.findUnique({ where: { id } });
  }

  async findByUser(userId: string, ctx?: RepoContext): Promise<Address[]> {
    return this.db(ctx).address.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }
}
