import { prisma } from "@/lib/db";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  createInventoryRepository,
  createProductRepository,
  type IInventoryRepository,
  type IProductRepository,
} from "@/modules/catalog/repository";
import {
  createCouponRepository,
  type ICouponRepository,
} from "@/modules/marketing/repository";
import {
  createAddressRepository,
  type IAddressRepository,
} from "@/modules/member/repository";
import {
  calcDiscount,
  calcShipping,
  calcSubtotal,
  checkoutSchema,
  ORDER_STATUS,
} from "../domain/order";
import {
  createCartRepository,
  createOrderRepository,
  type ICartRepository,
  type IOrderRepository,
  type OrderQueryInput,
} from "../repository";

/**
 * 下单服务:一个事务内完成
 *   取地址 → 取购物车 → 校验在售 → 计价 → 扣库存 → 建订单(含快照) → 核销券 → 清购物车。
 * 库存用条件更新防超卖;任一步抛错则整个事务回滚。
 * 跨模块协作:依赖 catalog/marketing/member 的 repository 接口。
 */
export class OrderService {
  constructor(
    private readonly carts: ICartRepository = createCartRepository(),
    private readonly orders: IOrderRepository = createOrderRepository(),
    private readonly inventory: IInventoryRepository = createInventoryRepository(),
    private readonly products: IProductRepository = createProductRepository(),
    private readonly coupons: ICouponRepository = createCouponRepository(),
    private readonly addresses: IAddressRepository = createAddressRepository(),
  ) {}

  async checkout(
    userId: string,
    rawInput: unknown,
  ): Promise<{ orderNo: string; payAmount: number }> {
    const input = checkoutSchema.parse(rawInput);

    return prisma.$transaction(async (tx) => {
      const ctx = { tx, actorId: userId };

      // 1. 收货地址(做快照,用户后续改地址不影响订单)
      const address = await this.addresses.findById(input.addressId, ctx);
      if (!address || address.userId !== userId) {
        throw new NotFoundError("收货地址不存在");
      }

      // 2. 购物车已勾选项
      const cart = await this.carts.findActiveCartByUserId(userId, ctx);
      const items = (cart?.items ?? []).filter((i) => i.selected);
      if (items.length === 0) {
        throw new ValidationError("没有可结算的商品");
      }

      // 3. 校验商品/SKU 在售
      for (const item of items) {
        if (!item.product.isActive || item.product.status !== "active") {
          throw new ConflictError(`商品已下架:${item.product.name}`);
        }
        if (!item.sku.isActive) {
          throw new ConflictError(`规格已下架:${item.sku.name ?? item.sku.skuCode}`);
        }
      }

      // 4. 小计
      const subtotal = calcSubtotal(
        items.map((i) => ({ price: Number(i.sku.price), quantity: i.quantity })),
      );

      // 5. 优惠券
      let discount = 0;
      let couponId: string | null = null;
      let usedUserCouponId: string | null = null;
      if (input.userCouponId) {
        const uc = await this.coupons.findValidUserCoupon(
          userId,
          input.userCouponId,
          ctx,
        );
        if (!uc) throw new NotFoundError("优惠券不存在或已失效");
        discount = calcDiscount(
          {
            type: uc.coupon.type,
            value: Number(uc.coupon.value),
            minAmount: Number(uc.coupon.minAmount),
            maxDiscount: uc.coupon.maxDiscount ? Number(uc.coupon.maxDiscount) : null,
          },
          subtotal,
        );
        couponId = uc.couponId;
        usedUserCouponId = uc.id;
      }
      if (discount > subtotal) discount = subtotal;

      const shippingFee = calcShipping(subtotal);
      const payAmount = subtotal - discount + shippingFee;

      // 6. 扣库存(条件更新防超卖)+ 销量自增
      for (const item of items) {
        const ok = await this.inventory.decrementQuantity(
          item.skuId,
          item.quantity,
          ctx,
        );
        if (!ok) throw new ConflictError(`库存不足:${item.product.name}`);
        await this.products.incrementSales(item.productId, item.quantity, ctx);
      }

      // 7. 创建订单 + 订单项(商品快照,商品下架/改价不影响历史订单)
      const receiverAddress = [
        address.province,
        address.city,
        address.district,
        address.detail,
      ].join("");
      const order = await this.orders.createWithItems(
        {
          userId,
          status: ORDER_STATUS.PENDING_PAYMENT,
          totalAmount: subtotal,
          discountAmount: discount,
          shippingFee,
          payAmount,
          receiverName: address.receiver,
          receiverPhone: address.phone,
          receiverAddress,
          couponId,
          remark: input.remark ?? null,
          items: items.map((i) => ({
            productId: i.productId,
            skuId: i.skuId,
            productName: i.product.name,
            productImage: i.product.coverImage ?? null,
            skuName: i.sku.name,
            price: Number(i.sku.price),
            quantity: i.quantity,
            totalAmount: Number(i.sku.price) * i.quantity,
          })),
        },
        ctx,
      );

      // 8. 核销券
      if (usedUserCouponId) {
        await this.coupons.markUsed(usedUserCouponId, order.id, ctx);
      }

      // 9. 清空已下单的购物车项
      await this.carts.removeItems(items.map((i) => i.id), ctx);

      return { orderNo: order.orderNo, payAmount: Number(order.payAmount) };
    });
  }

  /** 我的订单列表 */
  async listMyOrders(userId: string, query: OrderQueryInput) {
    return this.orders.findManyByUser(userId, query);
  }

  /** 我的订单详情(校验归属,防越权) */
  async getMyOrder(userId: string, orderId: string) {
    const order = await this.orders.findById(orderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundError("订单不存在");
    }
    return order;
  }
}
