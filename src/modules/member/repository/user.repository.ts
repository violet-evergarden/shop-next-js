import type { User, UserLevel } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import type { Paginated } from "@/lib/types";

export type UserWithLevel = User & { level: UserLevel | null };

export interface UserAdminQuery {
  page: number;
  pageSize: number;
  status?: string;
  keyword?: string;
}

export interface IUserRepository {
  findById(id: string, ctx?: RepoContext): Promise<User | null>;
  findByWalletAddress(address: string, ctx?: RepoContext): Promise<User | null>;
  /** 查询或创建:首次登录时用,创建带 nonce 的用户 */
  findOrCreateByWalletAddress(
    address: string,
    nonce: string,
    ctx?: RepoContext,
  ): Promise<User>;
  updateNonce(id: string, nonce: string, ctx?: RepoContext): Promise<void>;
  updatePoints(id: string, delta: number, ctx?: RepoContext): Promise<void>;
  /** 后台:用户列表(含等级,可按 status/keyword 过滤) */
  findAll(
    query: UserAdminQuery,
    ctx?: RepoContext,
  ): Promise<Paginated<UserWithLevel>>;
  /** 更新用户等级 */
  updateLevel(id: string, levelId: string, ctx?: RepoContext): Promise<void>;
  /** 查积分 <= points 的最高等级 */
  findBestLevelForPoints(points: number, ctx?: RepoContext): Promise<UserLevel | null>;
}
