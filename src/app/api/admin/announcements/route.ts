import { z } from "zod";
import { withErrorHandler } from "@/lib/http/with-handler";
import { withAdminAction } from "@/lib/http/with-audit";
import { ApiResponse } from "@/lib/response";
import { requireAdmin } from "@/lib/auth/session";
import { AnnouncementService } from "@/modules/content/service/announcement.service";
import { createAnnouncementSchema } from "@/modules/content/domain/announcement";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const GET = withErrorHandler(async (req) => {
  await requireAdmin();
  const query = querySchema.parse({
    page: req.nextUrl.searchParams.get("page") ?? undefined,
    pageSize: req.nextUrl.searchParams.get("pageSize") ?? undefined,
  });
  const service = new AnnouncementService();
  return ApiResponse.ok(await service.list(query));
});

export const POST = withAdminAction(
  "content",
  "新增公告",
  async (req) => {
    const admin = await requireAdmin();
    const input = createAnnouncementSchema.parse(await req.json());
    const service = new AnnouncementService();
    return ApiResponse.ok(await service.create(input, admin.adminId));
  },
);
