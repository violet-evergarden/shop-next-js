import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireUser } from "@/lib/auth/session";
import { CartService } from "@/modules/trade/service/cart.service";
import { addCartItemSchema } from "@/modules/trade/domain/cart";

/** 加购(同 SKU 自动累加) */
export const POST = withErrorHandler(async (req) => {
  const user = await requireUser();
  const input = addCartItemSchema.parse(await req.json());
  const service = new CartService();
  return ApiResponse.ok(await service.addItem(user.userId, input));
});
