import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireUser } from "@/lib/auth/session";
import { CartService } from "@/modules/trade/service/cart.service";

/** 查看我的购物车 */
export const GET = withErrorHandler(async () => {
  const user = await requireUser();
  const service = new CartService();
  return ApiResponse.ok(await service.getMyCart(user.userId));
});
