import type { PrismaClient, Admin } from "@prisma/client";
import type { RepoContext, TransactionClient } from "@/lib/repository";
import { prisma } from "@/lib/db";
import type { IAdminRepository, AdminWithRoles } from "./admin.repository";

export class PrismaAdminRepository implements IAdminRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return (ctx?.tx ?? this.client) as PrismaClient;
  }

  async findById(id: string, ctx?: RepoContext): Promise<Admin | null> {
    return this.db(ctx).admin.findUnique({ where: { id } });
  }

  async findByUsername(
    username: string,
    ctx?: RepoContext,
  ): Promise<Admin | null> {
    return this.db(ctx).admin.findUnique({ where: { username } });
  }

  async updateLastLogin(
    id: string,
    ip: string | null,
    ctx?: RepoContext,
  ): Promise<void> {
    await this.db(ctx).admin.update({
      where: { id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });
  }

  async findAllWithRoles(ctx?: RepoContext): Promise<AdminWithRoles[]> {
    return this.db(ctx).admin.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: { roles: { include: { role: true } } },
    }) as Promise<AdminWithRoles[]>;
  }
}
