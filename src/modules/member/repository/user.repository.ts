import type { User } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";

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
}
