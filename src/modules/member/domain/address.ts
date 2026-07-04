import { z } from "zod";

/** 新增收货地址 */
export const createAddressSchema = z.object({
  receiver: z.string().min(1),
  phone: z.string().min(1),
  province: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  detail: z.string().min(1),
  tag: z.string().optional(),
  isDefault: z.boolean().optional(),
});
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
