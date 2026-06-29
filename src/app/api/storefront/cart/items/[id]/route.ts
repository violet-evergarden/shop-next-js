import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { NotFoundError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/session";
import { CartService } from "@/modules/trade/service/cart.service";
import { updateCartItemSchema } from "@/modules/trade/domain/cart";

/** 改数量(<=0 由 service 删除) */
export const PATCH = withErrorHandler(async (req, ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const itemId = Array.isArray(id) ? id[0] : id;
  if (!itemId) throw new NotFoundError("购物车项不存在");
  const { quantity } = updateCartItemSchema.parse(await req.json());
  const service = new CartService();
  await service.setItemQuantity(user.userId, itemId, quantity);
  return ApiResponse.ok(await service.getMyCart(user.userId));
});

/** 删单项 */
export const DELETE = withErrorHandler(async (_req, ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const itemId = Array.isArray(id) ? id[0] : id;
  if (!itemId) throw new NotFoundError("购物车项不存在");
  const service = new CartService();
  await service.removeItem(user.userId, itemId);
  return ApiResponse.ok(await service.getMyCart(user.userId));
});
