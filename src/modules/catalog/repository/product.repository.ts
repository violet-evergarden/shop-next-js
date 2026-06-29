import type { Product, Prisma } from "@prisma/client";
import type { Paginated } from "@/lib/types";
import type { RepoContext } from "@/lib/repository";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
} from "../domain/product";

/** 商品详情(含 SKU/库存/图片/分类/品牌) */
export type ProductDetail = Prisma.ProductGetPayload<{
  include: {
    skus: { include: { inventory: true } };
    images: true;
    category: true;
    brand: true;
  };
}>;

export interface IProductRepository {
  findById(id: string, ctx?: RepoContext): Promise<Product | null>;
  findBySlug(slug: string, ctx?: RepoContext): Promise<Product | null>;
  findDetailBySlug(slug: string, ctx?: RepoContext): Promise<ProductDetail | null>;
  findMany(
    query: ProductQueryInput,
    ctx?: RepoContext,
  ): Promise<Paginated<Product>>;
  create(input: CreateProductInput, ctx?: RepoContext): Promise<Product>;
  update(
    id: string,
    input: UpdateProductInput,
    ctx?: RepoContext,
  ): Promise<Product>;
  softDelete(id: string, ctx?: RepoContext): Promise<void>;
  incrementSales(id: string, by: number, ctx?: RepoContext): Promise<void>;
}
