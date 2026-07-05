import { z } from "zod";
import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireUser } from "@/lib/auth/session";
import { FavoriteService } from "@/modules/member/service/favorite.service";

/** 我的收藏列表 */
export const GET = withErrorHandler(async () => {
  const user = await requireUser();
  const service = new FavoriteService();
  return ApiResponse.ok(await service.listMy(user.userId));
});

/** 切换收藏(toggle) */
export const POST = withErrorHandler(async (req) => {
  const user = await requireUser();
  const { productId } = z
    .object({ productId: z.string().min(1) })
    .parse(await req.json());
  const service = new FavoriteService();
  const favorited = await service.toggle(user.userId, productId);
  return ApiResponse.ok({ favorited });
});
