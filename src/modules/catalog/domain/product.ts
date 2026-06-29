import { z } from "zod";

/**
 * 商品领域层:状态常量 + Zod schema(领域契约)。
 * 不依赖 Prisma / Next.js,可独立单测。
 * 这些 schema 同时作为 API 入参校验,保证"一处定义,多层复用"。
 */

/** 商品状态(用 String 常量替代数据库 enum,三库通用) */
export const PRODUCT_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;
export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export const productStatusSchema = z.enum([
  PRODUCT_STATUS.DRAFT,
  PRODUCT_STATUS.ACTIVE,
  PRODUCT_STATUS.ARCHIVED,
]);

/** 创建商品输入 */
export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  // Decimal 字段:Prisma 接受 number。生产若需更高精度可改 z.string() + 服务端转 Decimal。
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().optional(),
  status: productStatusSchema.default(PRODUCT_STATUS.DRAFT),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

/** 更新商品输入(全部可选) */
export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

/** 商品列表查询输入 */
export const productQuerySchema = z.object({
  keyword: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  status: productStatusSchema.optional(),
  includeDeleted: z.boolean().default(false),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
