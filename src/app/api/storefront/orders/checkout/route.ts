import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireUser } from "@/lib/auth/session";
import { OrderService } from "@/modules/trade/service/order.service";

/** 下单(从购物车结算) */
export const POST = withErrorHandler(async (req) => {
  const user = await requireUser();
  const service = new OrderService();
  const result = await service.checkout(user.userId, await req.json());
  return ApiResponse.ok(result);
});
