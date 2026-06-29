import { z } from "zod";

/** 订单状态(对应后台"待付款/已付款/已发货/已完成/已退款") */
export const ORDER_STATUS = {
  PENDING_PAYMENT: "pending_payment",
  PAID: "paid",
  SHIPPED: "shipped",
  COMPLETED: "completed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** 下单输入 */
export const checkoutSchema = z.object({
  addressId: z.string().min(1),
  userCouponId: z.string().optional(),
  remark: z.string().max(200).optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

/**
 * 价格计算 —— 纯函数,不依赖 Prisma/Decimal,可独立单测。
 * service 调用前把 Decimal 转成 number 传入。
 */

/** 商品小计 */
export function calcSubtotal(
  items: { price: number; quantity: number }[],
): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

/**
 * 优惠金额。
 * coupon.type=fixed(满减):减 value,不超过 subtotal。
 * coupon.type=percentage(折扣):value 视为减免比例(0.1=减 10%),受 maxDiscount 限制。
 * 不满足 minAmount 门槛则不生效。
 */
export function calcDiscount(
  coupon: {
    type: string;
    value: number;
    minAmount: number;
    maxDiscount: number | null;
  },
  subtotal: number,
): number {
  if (subtotal < coupon.minAmount) return 0;
  if (coupon.type === "fixed") return Math.min(coupon.value, subtotal);
  if (coupon.type === "percentage") {
    const d = subtotal * coupon.value;
    return coupon.maxDiscount !== null ? Math.min(d, coupon.maxDiscount) : d;
  }
  return 0;
}

/** 运费:满阈值免邮,否则固定运费 */
export function calcShipping(
  subtotal: number,
  freeThreshold = 99,
  fee = 10,
): number {
  return subtotal >= freeThreshold ? 0 : fee;
}

/** 我的订单列表查询 */
export const orderListSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});
