import type { Favorite, Product } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";

export type FavoriteWithProduct = Favorite & { product: Product };

export interface IFavoriteRepository {
  /** 切换收藏:已收藏则取消,未收藏则添加。返回 true=已收藏 false=已取消 */
  toggle(
    userId: string,
    productId: string,
    ctx?: RepoContext,
  ): Promise<boolean>;
  /** 用户的收藏列表(含商品) */
  findByUser(
    userId: string,
    ctx?: RepoContext,
  ): Promise<FavoriteWithProduct[]>;
}
