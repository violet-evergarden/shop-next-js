import type { PrismaClient, Coupon, UserCoupon } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { USER_COUPON_STATUS } from "../domain/coupon";
import type {
  ICouponRepository,
  UserCouponWithCoupon,
} from "./coupon.repository";

export class PrismaCouponRepository implements ICouponRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return (ctx?.tx ?? this.client) as PrismaClient;
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

  async findClaimable(ctx?: RepoContext): Promise<Coupon[]> {
    const now = new Date();
    return this.db(ctx).coupon.findMany({
      where: {
        isActive: true,
        OR: [{ validTo: null }, { validTo: { gt: now } }],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async claim(
    userId: string,
    couponId: string,
    ctx?: RepoContext,
  ): Promise<UserCoupon> {
    // 顶层领取操作,自己开事务(claim 一般不在外部事务里)
    return this.client.$transaction(async (tx) => {
      const coupon = await tx.coupon.findUnique({ where: { id: couponId } });
      if (!coupon || !coupon.isActive) {
        throw new NotFoundError("优惠券不存在");
      }
      if (
        coupon.totalQuantity !== null &&
        coupon.issuedQuantity >= coupon.totalQuantity
      ) {
        throw new ConflictError("优惠券已领完");
      }
      // 防重复领取
      const existing = await tx.userCoupon.findFirst({
        where: { userId, couponId },
      });
      if (existing) {
        throw new ConflictError("已领取过该优惠券");
      }
      const [uc] = await Promise.all([
        tx.userCoupon.create({
          data: { userId, couponId, createdBy: ctx?.actorId },
        }),
        tx.coupon.update({
          where: { id: couponId },
          data: { issuedQuantity: { increment: 1 } },
        }),
      ]);
      return uc;
    });
  }
}
