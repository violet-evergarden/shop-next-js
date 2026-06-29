import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PrismaUserRepository } from "./prisma-user.repository";
import { PrismaAddressRepository } from "./prisma-address.repository";
import type { IUserRepository } from "./user.repository";
import type { IAddressRepository } from "./address.repository";

export type { IUserRepository, IAddressRepository };

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
