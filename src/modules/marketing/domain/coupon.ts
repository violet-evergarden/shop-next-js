/** 优惠券类型 */
export const COUPON_TYPE = {
  FIXED: "fixed", // 满减
  PERCENTAGE: "percentage", // 折扣
} as const;
export type CouponType = (typeof COUPON_TYPE)[keyof typeof COUPON_TYPE];

/** 用户券状态 */
export const USER_COUPON_STATUS = {
  UNUSED: "unused",
  USED: "used",
  EXPIRED: "expired",
} as const;
export type UserCouponStatus = (typeof USER_COUPON_STATUS)[keyof typeof USER_COUPON_STATUS];
