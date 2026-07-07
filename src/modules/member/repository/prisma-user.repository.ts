import type { PrismaClient, User, UserLevel } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import { toSkip, toPaginated, type Paginated } from "@/lib/types";
import type {
  IUserRepository,
  UserWithLevel,
  UserAdminQuery,
} from "./user.repository";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return (ctx?.tx ?? this.client) as PrismaClient;
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
      update: { nonce },
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

  async findAll(
    query: UserAdminQuery,
    ctx?: RepoContext,
  ): Promise<Paginated<UserWithLevel>> {
    const where = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.keyword
        ? {
            OR: [
              { username: { contains: query.keyword } },
              { walletAddress: { contains: query.keyword } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.db(ctx).user.findMany({
        where,
        skip: toSkip(query),
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
        include: { level: true },
      }),
      this.db(ctx).user.count({ where }),
    ]);
    return toPaginated(items, total, query);
  }

  async updateLevel(id: string, levelId: string, ctx?: RepoContext): Promise<void> {
    await this.db(ctx).user.update({ where: { id }, data: { levelId } });
  }

  async findBestLevelForPoints(
    points: number,
    ctx?: RepoContext,
  ): Promise<UserLevel | null> {
    const levels = await this.db(ctx).userLevel.findMany({
      where: { minPoints: { lte: points } },
      orderBy: { minPoints: "desc" },
    });
    return levels[0] ?? null;
  }
}
