import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PrismaCouponRepository } from "./prisma-coupon.repository";
import type { ICouponRepository, UserCouponWithCoupon } from "./coupon.repository";

export type { ICouponRepository, UserCouponWithCoupon };

export function createCouponRepository(
  client: PrismaClient = prisma,
): ICouponRepository {
  return new PrismaCouponRepository(client);
}
