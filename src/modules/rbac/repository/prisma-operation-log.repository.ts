import type { PrismaClient, OperationLog } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import { toSkip, toPaginated, type Paginated } from "@/lib/types";
import type {
  CreateOperationLogInput,
  IOperationLogRepository,
  OperationLogQuery,
} from "./operation-log.repository";

export class PrismaOperationLogRepository implements IOperationLogRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return (ctx?.tx ?? this.client) as PrismaClient;
  }

  async create(
    input: CreateOperationLogInput,
    ctx?: RepoContext,
  ): Promise<void> {
    await this.db(ctx).operationLog.create({
      data: {
        adminId: input.adminId,
        module: input.module,
        action: input.action,
        method: input.method,
        path: input.path,
        params: input.params,
        ip: input.ip,
        userAgent: input.userAgent,
        status: input.status,
        duration: input.duration,
        errorMessage: input.errorMessage,
        createdBy: input.adminId,
      },
    });
  }

  async findMany(
    query: OperationLogQuery,
    ctx?: RepoContext,
  ): Promise<Paginated<OperationLog>> {
    const where = {
      ...(query.module ? { module: query.module } : {}),
      ...(query.adminId ? { adminId: query.adminId } : {}),
    };
    const [items, total] = await Promise.all([
      this.db(ctx).operationLog.findMany({
        where,
        skip: toSkip(query),
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.db(ctx).operationLog.count({ where }),
    ]);
    return toPaginated(items, total, query);
  }
}
