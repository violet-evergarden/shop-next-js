import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PrismaAdminRepository } from "./prisma-admin.repository";
import { PrismaPermissionRepository } from "./prisma-permission.repository";
import { PrismaOperationLogRepository } from "./prisma-operation-log.repository";
import type { IAdminRepository } from "./admin.repository";
import type { IPermissionRepository } from "./permission.repository";
import type {
  IOperationLogRepository,
  CreateOperationLogInput,
  OperationLogQuery,
} from "./operation-log.repository";

export type {
  IAdminRepository,
  IPermissionRepository,
  IOperationLogRepository,
  CreateOperationLogInput,
  OperationLogQuery,
};

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

export function createOperationLogRepository(
  client: PrismaClient = prisma,
): IOperationLogRepository {
  return new PrismaOperationLogRepository(client);
}
