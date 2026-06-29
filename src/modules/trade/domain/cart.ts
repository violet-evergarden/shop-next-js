import { z } from "zod";

/** 加购输入 */
export const addCartItemSchema = z.object({
  skuId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

/** 改数量输入 */
export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});
