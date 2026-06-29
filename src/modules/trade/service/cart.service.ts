import type { ICartRepository } from "../repository";
import { createCartRepository } from "../repository";
import type { AddCartItemInput } from "../domain/cart";

/** 前台购物车服务 */
export class CartService {
  constructor(
    private readonly carts: ICartRepository = createCartRepository(),
  ) {}

  async getMyCart(userId: string) {
    return this.carts.findActiveCartByUserId(userId);
  }

  async addItem(userId: string, input: AddCartItemInput) {
    return this.carts.addItem(userId, input);
  }

  async setItemQuantity(userId: string, itemId: string, quantity: number) {
    await this.carts.setItemQuantity(userId, itemId, quantity);
  }

  async removeItem(userId: string, itemId: string) {
    await this.carts.removeItem(userId, itemId);
  }
}
