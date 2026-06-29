import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PrismaAdminRepository } from "./prisma-admin.repository";
import { PrismaPermissionRepository } from "./prisma-permission.repository";
import type { IAdminRepository } from "./admin.repository";
import type { IPermissionRepository } from "./permission.repository";

export type { IAdminRepository, IPermissionRepository };

export function createAdminRepository(
  client: PrismaClient = prisma,
): IAdminRepository {
  return new PrismaAdminRepository(client);
}

export function createPermissionRepository(
  client: PrismaClient = prisma,
): IPermissionRepository {
  return new PrismaPermissionRepository(client);
}
