import type { PrismaClient, Product, Prisma } from "@prisma/client";
import { toSkip, toPaginated, type Paginated } from "@/lib/types";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
} from "../domain/product";
import type { IProductRepository } from "./product.repository";

/**
 * 商品仓储的 Prisma 实现(adapter)。
 * - 默认查询排除软删除(deletedAt: null),除非显式 includeDeleted。
 * - 审计字段 createdBy/updatedBy 由 ctx.actorId 自动填充。
 * - 事务:ctx.tx 存在时用事务客户端,否则用默认 client。
 */
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return ctx?.tx ?? this.client;
  }

  async findById(id: string, ctx?: RepoContext): Promise<Product | null> {
    return this.db(ctx).product.findUnique({ where: { id } });
  }

  async findBySlug(slug: string, ctx?: RepoContext): Promise<Product | null> {
    return this.db(ctx).product.findUnique({ where: { slug } });
  }

  async findMany(
    query: ProductQueryInput,
    ctx?: RepoContext,
  ): Promise<Paginated<Product>> {
    // contains 三库均支持(LIKE/ILIKE)。注:大小写敏感性跨库不同
    // (PG 默认敏感,MySQL/SQLite 默认不敏感),Prisma 的 insensitive mode 仅 PG/MySQL 支持,
    // 故此处不指定 mode 以保三库兼容;精细大小写需求留到应用层。
    const where: Prisma.ProductWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.keyword ? { name: { contains: query.keyword } } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.brandId ? { brandId: query.brandId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.db(ctx).product.findMany({
        where,
        skip: toSkip(query),
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.db(ctx).product.count({ where }),
    ]);

    return toPaginated(items, total, query);
  }

  async create(input: CreateProductInput, ctx?: RepoContext): Promise<Product> {
    return this.db(ctx).product.create({
      data: { ...input, createdBy: ctx?.actorId },
    });
  }

  async update(
    id: string,
    input: UpdateProductInput,
    ctx?: RepoContext,
  ): Promise<Product> {
    return this.db(ctx).product.update({
      where: { id },
      data: { ...input, updatedBy: ctx?.actorId },
    });
  }

  async softDelete(id: string, ctx?: RepoContext): Promise<void> {
    await this.db(ctx).product.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: ctx?.actorId },
    });
  }

  async incrementSales(
    id: string,
    by: number,
    ctx?: RepoContext,
  ): Promise<void> {
    await this.db(ctx).product.update({
      where: { id },
      data: { sales: { increment: by } },
    });
  }
}
