import type { Prisma } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import type { AddCartItemInput } from "../domain/cart";

/** 购物车(含项 + SKU + 商品) */
export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: { include: { sku: true; product: true } };
  };
}>;

export interface ICartRepository {
  findActiveCartByUserId(
    userId: string,
    ctx?: RepoContext,
  ): Promise<CartWithItems | null>;
  /** 加购(自动建购物车;同 SKU 累加数量) */
  addItem(
    userId: string,
    data: AddCartItemInput,
    ctx?: RepoContext,
  ): Promise<CartWithItems>;
  /** 改数量(<=0 则删除) */
  setItemQuantity(
    userId: string,
    itemId: string,
    quantity: number,
    ctx?: RepoContext,
  ): Promise<void>;
  /** 删单项 */
  removeItem(userId: string, itemId: string, ctx?: RepoContext): Promise<void>;
  /** 批量删(下单清空用) */
  removeItems(itemIds: string[], ctx?: RepoContext): Promise<void>;
}
