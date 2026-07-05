import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { CouponService } from "@/modules/marketing/service/coupon.service";

/** 可领取的优惠券列表(公开) */
export const GET = withErrorHandler(async () => {
  const service = new CouponService();
  return ApiResponse.ok(await service.listClaimable());
});
