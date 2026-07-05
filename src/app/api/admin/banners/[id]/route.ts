import { withAdminAction } from "@/lib/http/with-audit";
import { ApiResponse } from "@/lib/response";
import { NotFoundError } from "@/lib/errors";
import { type RouteContext } from "@/lib/http/with-handler";
import { requireAdmin } from "@/lib/auth/session";
import { BannerService } from "@/modules/content/service/banner.service";
import { updateBannerSchema } from "@/modules/content/domain/banner";

async function getId(ctx: RouteContext) {
  const { id } = await ctx.params;
  const idStr = Array.isArray(id) ? id[0] : id;
  if (!idStr) throw new NotFoundError("Banner 不存在");
  return idStr;
}

export const PATCH = withAdminAction(
  "content",
  "更新Banner",
  async (req, ctx) => {
    const admin = await requireAdmin();
    const id = await getId(ctx);
    const input = updateBannerSchema.parse(await req.json());
    const service = new BannerService();
    return ApiResponse.ok(await service.update(id, input, admin.adminId));
  },
);

export const DELETE = withAdminAction(
  "content",
  "删除Banner",
  async (_req, ctx) => {
    const admin = await requireAdmin();
    const id = await getId(ctx);
    const service = new BannerService();
    await service.remove(id, admin.adminId);
    return ApiResponse.ok({ id });
  },
);
