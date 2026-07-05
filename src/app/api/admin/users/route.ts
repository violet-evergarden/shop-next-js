import { z } from "zod";
import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireAdmin } from "@/lib/auth/session";
import { UserService } from "@/modules/member/service/user.service";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  keyword: z.string().optional(),
});

/** 后台:会员列表 */
export const GET = withErrorHandler(async (req) => {
  await requireAdmin();
  const sp = req.nextUrl.searchParams;
  const query = querySchema.parse({
    page: sp.get("page") ?? undefined,
    pageSize: sp.get("pageSize") ?? undefined,
    status: sp.get("status") ?? undefined,
    keyword: sp.get("keyword") ?? undefined,
  });
  const service = new UserService();
  return ApiResponse.ok(await service.listAll(query));
});
