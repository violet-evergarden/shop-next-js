import type { IFavoriteRepository } from "../repository";
import { createFavoriteRepository } from "../repository";

/** 收藏服务 */
export class FavoriteService {
  constructor(
    private readonly favorites: IFavoriteRepository = createFavoriteRepository(),
  ) {}

  /** 切换收藏状态,返回 true=已收藏 false=已取消 */
  async toggle(userId: string, productId: string) {
    return this.favorites.toggle(userId, productId);
  }

  /** 我的收藏列表 */
  async listMy(userId: string) {
    return this.favorites.findByUser(userId);
  }
}
