import type { IProductRepository, ICategoryRepository } from "../repository";
import {
  createProductRepository,
  createCategoryRepository,
} from "../repository";
import {
  PRODUCT_STATUS,
  type ProductQueryInput,
  type CreateProductInput,
  type UpdateProductInput,
} from "../domain/product";
import { NotFoundError } from "@/lib/errors";

/** 前台商品浏览服务 */
export class ProductService {
  constructor(
    private readonly products: IProductRepository = createProductRepository(),
    private readonly categories: ICategoryRepository = createCategoryRepository(),
  ) {}

  /** 商品列表(前台固定只看在售 active) */
  async list(query: ProductQueryInput) {
    return this.products.findMany({ ...query, status: PRODUCT_STATUS.ACTIVE });
  }

  /** 商品列表(后台管理,含全部状态 draft/active/archived) */
  async listAll(query: ProductQueryInput) {
    return this.products.findMany(query);
  }

  /** 商品详情(含 SKU/库存/图片/分类/品牌) */
  async getDetail(slug: string) {
    const product = await this.products.findDetailBySlug(slug);
    if (!product || product.deletedAt || !product.isActive) {
      throw new NotFoundError("商品不存在或已下架");
    }
    return product;
  }

  /** 分类导航 */
  async listCategories() {
    return this.categories.findActive();
  }

  /** 后台:按 id 取商品(含 draft/archived) */
  async getById(id: string) {
    const product = await this.products.findById(id);
    if (!product) throw new NotFoundError("商品不存在");
    return product;
  }

  /** 后台:新增商品 */
  async create(input: CreateProductInput, actorId?: string) {
    return this.products.create(input, { actorId });
  }

  /** 后台:更新商品 */
  async update(id: string, input: UpdateProductInput, actorId?: string) {
    return this.products.update(id, input, { actorId });
  }

  /** 后台:软删除商品 */
  async remove(id: string, actorId?: string) {
    await this.products.softDelete(id, { actorId });
  }
}
