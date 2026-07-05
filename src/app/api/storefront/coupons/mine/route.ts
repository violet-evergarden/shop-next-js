import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireUser } from "@/lib/auth/session";
import { CouponService } from "@/modules/marketing/service/coupon.service";

/** 我的优惠券 */
export const GET = withErrorHandler(async () => {
  const user = await requireUser();
  const service = new CouponService();
  return ApiResponse.ok(await service.listMy(user.userId));
});
