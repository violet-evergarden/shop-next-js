import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PrismaBannerRepository } from "./prisma-banner.repository";
import type { IBannerRepository, BannerQuery } from "./banner.repository";

export type { IBannerRepository, BannerQuery };

export function createBannerRepository(
  client: PrismaClient = prisma,
): IBannerRepository {
  return new PrismaBannerRepository(client);
}
