import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireUser } from "@/lib/auth/session";
import { OrderService } from "@/modules/trade/service/order.service";
import { orderListSchema } from "@/modules/trade/domain/order";

/** 我的订单列表 */
export const GET = withErrorHandler(async (req) => {
  const user = await requireUser();
  const sp = req.nextUrl.searchParams;
  const query = orderListSchema.parse({
    page: Number(sp.get("page") ?? 1),
    pageSize: Number(sp.get("pageSize") ?? 20),
    status: sp.get("status") ?? undefined,
  });
  const service = new OrderService();
  return ApiResponse.ok(await service.listMyOrders(user.userId, query));
});
