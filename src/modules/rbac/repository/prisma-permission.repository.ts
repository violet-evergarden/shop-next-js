import type { PrismaClient, Permission } from "@prisma/client";
import type { RepoContext, TransactionClient } from "@/lib/repository";
import { prisma } from "@/lib/db";
import { PERMISSION_TYPE } from "../domain/permission";
import type { IPermissionRepository } from "./permission.repository";

export class PrismaPermissionRepository implements IPermissionRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return (ctx?.tx ?? this.client) as PrismaClient;
  }

  async findByAdminId(
    adminId: string,
    ctx?: RepoContext,
  ): Promise<Permission[]> {
    // admin -> adminRole -> role -> rolePermission -> permission
    // `some` 是存在性子查询,不会产生重复行,无需 distinct
    return this.db(ctx).permission.findMany({
      where: {
        rolePerms: {
          some: { role: { admins: { some: { adminId } } } },
        },
      },
    });
  }

  async findMenusByAdminId(
    adminId: string,
    ctx?: RepoContext,
  ): Promise<Permission[]> {
    return this.db(ctx).permission.findMany({
      where: {
        type: PERMISSION_TYPE.MENU,
        isActive: true,
        isVisible: true,
        rolePerms: {
          some: { role: { admins: { some: { adminId } } } },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  }
}
