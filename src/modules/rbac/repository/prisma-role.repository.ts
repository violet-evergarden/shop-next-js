import type { PrismaClient, Role } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import type { IRoleRepository } from "./role.repository";

export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return (ctx?.tx ?? this.client) as PrismaClient;
  }

  async findAll(ctx?: RepoContext): Promise<Role[]> {
    return this.db(ctx).role.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
  }
}
