import type { PrismaClient, User } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import type { IUserRepository } from "./user.repository";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return ctx?.tx ?? this.client;
  }

  async findById(id: string, ctx?: RepoContext): Promise<User | null> {
    return this.db(ctx).user.findUnique({ where: { id } });
  }

  async findByWalletAddress(
    address: string,
    ctx?: RepoContext,
  ): Promise<User | null> {
    return this.db(ctx).user.findUnique({ where: { walletAddress: address } });
  }

  async findOrCreateByWalletAddress(
    address: string,
    nonce: string,
    ctx?: RepoContext,
  ): Promise<User> {
    return this.db(ctx).user.upsert({
      where: { walletAddress: address },
      create: { walletAddress: address, nonce },
      update: { nonce }, // 已存在则刷新 nonce
    });
  }

  async updateNonce(id: string, nonce: string, ctx?: RepoContext): Promise<void> {
    await this.db(ctx).user.update({ where: { id }, data: { nonce } });
  }

  async updatePoints(id: string, delta: number, ctx?: RepoContext): Promise<void> {
    await this.db(ctx).user.update({
      where: { id },
      data: { points: { increment: delta } },
    });
  }
}
