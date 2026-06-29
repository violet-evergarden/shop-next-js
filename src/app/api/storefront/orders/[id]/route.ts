import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { NotFoundError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/session";
import { OrderService } from "@/modules/trade/service/order.service";

/** 我的订单详情(校验归属) */
export const GET = withErrorHandler(async (_req, ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const orderId = Array.isArray(id) ? id[0] : id;
  if (!orderId) throw new NotFoundError("订单不存在");
  const service = new OrderService();
  return ApiResponse.ok(await service.getMyOrder(user.userId, orderId));
});
