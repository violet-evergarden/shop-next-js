import { withAdminAction } from "@/lib/http/with-audit";
import { ApiResponse } from "@/lib/response";
import { NotFoundError } from "@/lib/errors";
import { type RouteContext } from "@/lib/http/with-handler";
import { requireAdmin } from "@/lib/auth/session";
import { AnnouncementService } from "@/modules/content/service/announcement.service";
import { updateAnnouncementSchema } from "@/modules/content/domain/announcement";

async function getId(ctx: RouteContext) {
  const { id } = await ctx.params;
  const idStr = Array.isArray(id) ? id[0] : id;
  if (!idStr) throw new NotFoundError("公告不存在");
  return idStr;
}

export const PATCH = withAdminAction(
  "content",
  "更新公告",
  async (req, ctx) => {
    const admin = await requireAdmin();
    const id = await getId(ctx);
    const input = updateAnnouncementSchema.parse(await req.json());
    const service = new AnnouncementService();
    return ApiResponse.ok(await service.update(id, input, admin.adminId));
  },
);

export const DELETE = withAdminAction(
  "content",
  "删除公告",
  async (_req, ctx) => {
    const admin = await requireAdmin();
    const id = await getId(ctx);
    const service = new AnnouncementService();
    await service.remove(id, admin.adminId);
    return ApiResponse.ok({ id });
  },
);
