import type { Coupon, Prisma, UserCoupon } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";

/** 用户券(含券模板) */
export type UserCouponWithCoupon = Prisma.UserCouponGetPayload<{
  include: { coupon: true };
}>;

export interface ICouponRepository {
  /** 取用户某张有效券(未使用、券启用且在有效期内) */
  findValidUserCoupon(
    userId: string,
    userCouponId: string,
    ctx?: RepoContext,
  ): Promise<UserCouponWithCoupon | null>;
  /** 标记券已使用 */
  markUsed(
    userCouponId: string,
    orderId: string,
    ctx?: RepoContext,
  ): Promise<void>;
  /** 用户全部有效券(我的优惠券) */
  findValidByUser(
    userId: string,
    ctx?: RepoContext,
  ): Promise<UserCouponWithCoupon[]>;
  /** 可领取的券模板(启用 + 有效期内) */
  findClaimable(ctx?: RepoContext): Promise<Coupon[]>;
  /** 领取(事务:校验可领 + 防重复 + 建 UserCoupon + issuedQuantity++) */
  claim(
    userId: string,
    couponId: string,
    ctx?: RepoContext,
  ): Promise<UserCoupon>;
}
