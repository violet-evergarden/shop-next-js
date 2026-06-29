import type { Inventory } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";

export interface IInventoryRepository {
  findBySkuId(skuId: string, ctx?: RepoContext): Promise<Inventory | null>;
  /**
   * 条件扣减:仅当可售库存 >= needed 才扣,返回是否成功。
   * 用 updateMany + `where quantity >= needed` 实现,三库兼容
   * (SQLite 不支持 SELECT FOR UPDATE,故用条件更新防超卖)。
   */
  decrementQuantity(
    skuId: string,
    needed: number,
    ctx?: RepoContext,
  ): Promise<boolean>;
}
