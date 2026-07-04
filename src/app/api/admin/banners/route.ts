import { z } from "zod";
import { withErrorHandler } from "@/lib/http/with-handler";
import { withAdminAction } from "@/lib/http/with-audit";
import { ApiResponse } from "@/lib/response";
import { requireAdmin } from "@/lib/auth/session";
import { BannerService } from "@/modules/content/service/banner.service";
import { createBannerSchema } from "@/modules/content/domain/banner";

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
  const service = new BannerService();
  return ApiResponse.ok(await service.list(query));
});

export const POST = withAdminAction("content", "新增Banner", async (req) => {
  const admin = await requireAdmin();
  const input = createBannerSchema.parse(await req.json());
  const service = new BannerService();
  return ApiResponse.ok(await service.create(input, admin.adminId));
});
