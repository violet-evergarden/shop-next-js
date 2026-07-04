import { z } from "zod";
import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireAdmin } from "@/lib/auth/session";
import { OperationLogService } from "@/modules/rbac/service/operation-log.service";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  module: z.string().optional(),
  adminId: z.string().optional(),
});

/** 操作日志列表 */
export const GET = withErrorHandler(async (req) => {
  await requireAdmin();
  const query = querySchema.parse({
    page: req.nextUrl.searchParams.get("page") ?? undefined,
    pageSize: req.nextUrl.searchParams.get("pageSize") ?? undefined,
    module: req.nextUrl.searchParams.get("module") ?? undefined,
    adminId: req.nextUrl.searchParams.get("adminId") ?? undefined,
  });
  const service = new OperationLogService();
  return ApiResponse.ok(await service.list(query));
});
