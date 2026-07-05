import type { ICouponRepository } from "../repository";
import { createCouponRepository } from "../repository";

/** 优惠券服务:领取 + 我的券 + 可领列表 */
export class CouponService {
  constructor(
    private readonly coupons: ICouponRepository = createCouponRepository(),
  ) {}

  /** 可领取的券模板(公开,无需登录) */
  async listClaimable() {
    return this.coupons.findClaimable();
  }

  /** 领取(返回新建的 UserCoupon) */
  async claim(userId: string, couponId: string, actorId?: string) {
    return this.coupons.claim(userId, couponId, { actorId });
  }

  /** 我的有效券 */
  async listMy(userId: string) {
    return this.coupons.findValidByUser(userId);
  }
}
