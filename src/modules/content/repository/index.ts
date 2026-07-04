import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PrismaBannerRepository } from "./prisma-banner.repository";
import { PrismaAnnouncementRepository } from "./prisma-announcement.repository";
import type { IBannerRepository, BannerQuery } from "./banner.repository";
import type {
  IAnnouncementRepository,
  AnnouncementQuery,
} from "./announcement.repository";

export type {
  IBannerRepository,
  BannerQuery,
  IAnnouncementRepository,
  AnnouncementQuery,
};

export function createBannerRepository(
  client: PrismaClient = prisma,
): IBannerRepository {
  return new PrismaBannerRepository(client);
}

export function createAnnouncementRepository(
  client: PrismaClient = prisma,
): IAnnouncementRepository {
  return new PrismaAnnouncementRepository(client);
}
