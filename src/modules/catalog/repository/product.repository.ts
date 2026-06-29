import type { Product } from "@prisma/client";
import type { Paginated } from "@/lib/types";
import type { RepoContext } from "@/lib/repository";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
} from "../domain/product";

/**
 * 商品仓储接口(port)。
 * Service 层只依赖这个接口,不直接碰 Prisma —— 这就是"可测试 + 可切换数据库/ORM"的关键:
 * 测试时注入返回假数据的 mock,换 ORM 时只改实现不改接口。
 */
export interface IProductRepository {
  findById(id: string, ctx?: RepoContext): Promise<Product | null>;
  findBySlug(slug: string, ctx?: RepoContext): Promise<Product | null>;
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
  /** 销量自增(下单流程用) */
  incrementSales(id: string, by: number, ctx?: RepoContext): Promise<void>;
}
