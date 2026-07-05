import { z } from "zod";
import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireUser } from "@/lib/auth/session";
import { CouponService } from "@/modules/marketing/service/coupon.service";

/** 领取优惠券 */
export const POST = withErrorHandler(async (req) => {
  const user = await requireUser();
  const { couponId } = z
    .object({ couponId: z.string().min(1) })
    .parse(await req.json());
  const service = new CouponService();
  const userCoupon = await service.claim(user.userId, couponId, user.userId);
  return ApiResponse.ok(userCoupon);
});
