import type { OperationLog } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import type { Paginated } from "@/lib/types";

export interface CreateOperationLogInput {
  adminId: string | null;
  module: string;
  action: string;
  method: string;
  path: string;
  params: string | null;
  ip: string | null;
  userAgent: string | null;
  status: number; // 1=成功 0=失败
  duration: number | null;
  errorMessage: string | null;
}

export interface OperationLogQuery {
  page: number;
  pageSize: number;
  module?: string;
  adminId?: string;
}

export interface IOperationLogRepository {
  create(input: CreateOperationLogInput, ctx?: RepoContext): Promise<void>;
  findMany(
    query: OperationLogQuery,
    ctx?: RepoContext,
  ): Promise<Paginated<OperationLog>>;
}
