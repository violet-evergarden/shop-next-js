import { withAdminAction } from "@/lib/http/with-audit";
import { ApiResponse } from "@/lib/response";
import { NotFoundError } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth/session";
import { type RouteContext } from "@/lib/http/with-handler";
import { ProductService } from "@/modules/catalog/service/product.service";
import { updateProductSchema } from "@/modules/catalog/domain/product";

async function getId(ctx: RouteContext) {
  const { id } = await ctx.params;
  const idStr = Array.isArray(id) ? id[0] : id;
  if (!idStr) throw new NotFoundError("商品不存在");
  return idStr;
}

/** 更新商品(自动记操作日志) */
export const PATCH = withAdminAction(
  "catalog",
  "更新商品",
  async (req, ctx) => {
    const admin = await requireAdmin();
    const id = await getId(ctx);
    const input = updateProductSchema.parse(await req.json());
    const service = new ProductService();
    return ApiResponse.ok(await service.update(id, input, admin.adminId));
  },
);

/** 软删除商品(自动记操作日志) */
export const DELETE = withAdminAction(
  "catalog",
  "删除商品",
  async (_req, ctx) => {
    const admin = await requireAdmin();
    const id = await getId(ctx);
    const service = new ProductService();
    await service.remove(id, admin.adminId);
    return ApiResponse.ok({ id });
  },
);
