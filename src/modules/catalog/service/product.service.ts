import type { IProductRepository, ICategoryRepository } from "../repository";
import {
  createProductRepository,
  createCategoryRepository,
} from "../repository";
import { PRODUCT_STATUS, type ProductQueryInput } from "../domain/product";
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
}
