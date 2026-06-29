import type { PrismaClient } from "@prisma/client";

/**
 * 事务客户端类型:即 Prisma 交互式事务 `prisma.$transaction(async (tx) => ...)`
 * 回调参数 tx 的类型。去掉非数据访问方法,保留所有 model 的 CRUD。
 *
 * Repository 方法接受可选的 tx,Service 在事务内编排多表写入时把 tx 透传下去,
 * 保证原子性;事务外则用默认 client。
 */
export type TransactionClient = Omit<
  PrismaClient,
  | "$connect"
  | "$disconnect"
  | "$on"
  | "$transaction"
  | "$use"
  | "$extends"
>;

/**
 * Repository 调用上下文。
 * - tx: 可选事务客户端,事务编排时传入。
 * - actorId: 操作者 id(admin 或 user),repository 自动写入 createdBy/updatedBy 审计字段。
 */
export interface RepoContext {
  tx?: TransactionClient;
  actorId?: string;
}
