import type { PrismaClient } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import { USER_COUPON_STATUS } from "../domain/coupon";
import type {
  ICouponRepository,
  UserCouponWithCoupon,
} from "./coupon.repository";

export class PrismaCouponRepository implements ICouponRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return ctx?.tx ?? this.client;
  }

  async findValidUserCoupon(
    userId: string,
    userCouponId: string,
    ctx?: RepoContext,
  ): Promise<UserCouponWithCoupon | null> {
    const now = new Date();
    return this.db(ctx).userCoupon.findFirst({
      where: {
        id: userCouponId,
        userId,
        status: USER_COUPON_STATUS.UNUSED,
        coupon: {
          isActive: true,
          OR: [{ validTo: null }, { validTo: { gt: now } }],
        },
      },
      include: { coupon: true },
    });
  }

  async markUsed(
    userCouponId: string,
    orderId: string,
    ctx?: RepoContext,
  ): Promise<void> {
    await this.db(ctx).userCoupon.update({
      where: { id: userCouponId },
      data: {
        status: USER_COUPON_STATUS.USED,
        orderId,
        usedAt: new Date(),
      },
    });
  }

  async findValidByUser(
    userId: string,
    ctx?: RepoContext,
  ): Promise<UserCouponWithCoupon[]> {
    const now = new Date();
    return this.db(ctx).userCoupon.findMany({
      where: {
        userId,
        status: USER_COUPON_STATUS.UNUSED,
        coupon: {
          isActive: true,
          OR: [{ validTo: null }, { validTo: { gt: now } }],
        },
      },
      include: { coupon: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
