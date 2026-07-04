import type { PrismaClient, Banner } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import { toSkip, toPaginated, type Paginated } from "@/lib/types";
import type {
  CreateBannerInput,
  UpdateBannerInput,
} from "../domain/banner";
import type { IBannerRepository, BannerQuery } from "./banner.repository";

export class PrismaBannerRepository implements IBannerRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return (ctx?.tx ?? this.client) as PrismaClient;
  }

  async findAll(
    query: BannerQuery,
    ctx?: RepoContext,
  ): Promise<Paginated<Banner>> {
    const where = { deletedAt: null };
    const [items, total] = await Promise.all([
      this.db(ctx).banner.findMany({
        where,
        skip: toSkip(query),
        take: query.pageSize,
        orderBy: { sortOrder: "asc" },
      }),
      this.db(ctx).banner.count({ where }),
    ]);
    return toPaginated(items, total, query);
  }

  async findActive(ctx?: RepoContext): Promise<Banner[]> {
    return this.db(ctx).banner.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
  }

  async create(
    input: CreateBannerInput,
    ctx?: RepoContext,
  ): Promise<Banner> {
    return this.db(ctx).banner.create({
      data: { ...input, createdBy: ctx?.actorId },
    });
  }

  async update(
    id: string,
    input: UpdateBannerInput,
    ctx?: RepoContext,
  ): Promise<Banner> {
    return this.db(ctx).banner.update({
      where: { id },
      data: { ...input, updatedBy: ctx?.actorId },
    });
  }

  async softDelete(id: string, ctx?: RepoContext): Promise<void> {
    await this.db(ctx).banner.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: ctx?.actorId },
    });
  }
}
