import type { Prisma } from "@prisma/client";

/**
 * 事务客户端类型:Prisma 官方的 $transaction tx 类型(Omit<PrismaClient, denyList>)。
 * 用于 RepoContext.tx,匹配 $transaction 回调的 tx 参数。
 *
 * 注:Prisma 7 的 model delegates 是 getter,Omit 后在 tsc 下不可见(运行时仍在)。
 * 所以 repository 内部 db(ctx) 会把结果 `as PrismaClient` 来访问 model。
 */
export type TransactionClient = Prisma.TransactionClient;

/**
 * Repository 调用上下文。
 * - tx: 可选事务客户端,事务编排时传入。
 * - actorId: 操作者 id(admin 或 user),repository 自动写入 createdBy/updatedBy 审计字段。
 */
export interface RepoContext {
  tx?: TransactionClient;
  actorId?: string;
}
