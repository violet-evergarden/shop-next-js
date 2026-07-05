import type { PrismaClient, Address } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import type { CreateAddressInput } from "../domain/address";
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

  async create(
    userId: string,
    input: CreateAddressInput,
    ctx?: RepoContext,
  ): Promise<Address> {
    return this.db(ctx).address.create({
      data: { userId, ...input, createdBy: ctx?.actorId },
    });
  }

  async remove(userId: string, id: string, ctx?: RepoContext): Promise<void> {
    // where 带 userId,只能删自己的地址
    await this.db(ctx).address.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date(), updatedBy: ctx?.actorId },
    });
  }
}
