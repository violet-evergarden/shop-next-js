import type { PrismaClient, Announcement } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import { toSkip, toPaginated, type Paginated } from "@/lib/types";
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "../domain/announcement";
import type {
  IAnnouncementRepository,
  AnnouncementQuery,
} from "./announcement.repository";

export class PrismaAnnouncementRepository implements IAnnouncementRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return (ctx?.tx ?? this.client) as PrismaClient;
  }

  async findAll(
    query: AnnouncementQuery,
    ctx?: RepoContext,
  ): Promise<Paginated<Announcement>> {
    const where = { deletedAt: null };
    const [items, total] = await Promise.all([
      this.db(ctx).announcement.findMany({
        where,
        skip: toSkip(query),
        take: query.pageSize,
        orderBy: { sortOrder: "asc" },
      }),
      this.db(ctx).announcement.count({ where }),
    ]);
    return toPaginated(items, total, query);
  }

  async findActive(ctx?: RepoContext): Promise<Announcement[]> {
    return this.db(ctx).announcement.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
    });
  }

  async create(
    input: CreateAnnouncementInput,
    ctx?: RepoContext,
  ): Promise<Announcement> {
    return this.db(ctx).announcement.create({
      data: { ...input, createdBy: ctx?.actorId },
    });
  }

  async update(
    id: string,
    input: UpdateAnnouncementInput,
    ctx?: RepoContext,
  ): Promise<Announcement> {
    return this.db(ctx).announcement.update({
      where: { id },
      data: { ...input, updatedBy: ctx?.actorId },
    });
  }

  async softDelete(id: string, ctx?: RepoContext): Promise<void> {
    await this.db(ctx).announcement.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: ctx?.actorId },
    });
  }
}
