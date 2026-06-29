import type { PrismaClient, Product, Prisma } from "@prisma/client";
import { toSkip, toPaginated, type Paginated } from "@/lib/types";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
} from "../domain/product";
import type { IProductRepository, ProductDetail } from "./product.repository";

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

  async findDetailBySlug(
    slug: string,
    ctx?: RepoContext,
  ): Promise<ProductDetail | null> {
    return this.db(ctx).product.findUnique({
      where: { slug },
      include: {
        skus: { where: { isActive: true }, include: { inventory: true } },
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        brand: true,
      },
    });
  }

  async findMany(
    query: ProductQueryInput,
    ctx?: RepoContext,
  ): Promise<Paginated<Product>> {
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
