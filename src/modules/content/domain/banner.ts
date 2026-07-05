import { z } from "zod";

export const createBannerSchema = z.object({
  title: z.string().min(1),
  image: z.string().min(1),
  link: z.string().optional(),
  position: z.string().default("home"),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
export type CreateBannerInput = z.infer<typeof createBannerSchema>;

export const updateBannerSchema = createBannerSchema.partial();
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
