import { z } from "zod";

export const createAnnouncementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.string().default("notice"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

export const updateAnnouncementSchema = createAnnouncementSchema.partial();
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
