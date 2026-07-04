import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PrismaUserRepository } from "./prisma-user.repository";
import { PrismaAddressRepository } from "./prisma-address.repository";
import { PrismaFavoriteRepository } from "./prisma-favorite.repository";
import type { IUserRepository } from "./user.repository";
import type { IAddressRepository } from "./address.repository";
import type { IFavoriteRepository } from "./favorite.repository";

export type {
  IUserRepository,
  IAddressRepository,
  IFavoriteRepository,
};

export function createUserRepository(
  client: PrismaClient = prisma,
): IUserRepository {
  return new PrismaUserRepository(client);
}

export function createAddressRepository(
  client: PrismaClient = prisma,
): IAddressRepository {
  return new PrismaAddressRepository(client);
}

export function createFavoriteRepository(
  client: PrismaClient = prisma,
): IFavoriteRepository {
  return new PrismaFavoriteRepository(client);
}
