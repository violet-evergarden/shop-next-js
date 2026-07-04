import { z } from "zod";
import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireAdmin } from "@/lib/auth/session";
import { OrderService } from "@/modules/trade/service/order.service";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});

/** 后台订单列表(按状态过滤) */
export const GET = withErrorHandler(async (req) => {
  await requireAdmin();
  const query = querySchema.parse({
    page: req.nextUrl.searchParams.get("page") ?? undefined,
    pageSize: req.nextUrl.searchParams.get("pageSize") ?? undefined,
    status: req.nextUrl.searchParams.get("status") ?? undefined,
  });
  const service = new OrderService();
  return ApiResponse.ok(await service.listAll(query));
});
