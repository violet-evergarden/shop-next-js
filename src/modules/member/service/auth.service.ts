import type { IUserRepository } from "../repository";
import { createUserRepository } from "../repository";
import { buildNonceMessage, USER_STATUS } from "../domain/user";
import { generateNonce } from "@/lib/web3/nonce";
import { recoverSignerAddress } from "@/lib/web3/verify";
import { signUserToken } from "@/lib/auth/jwt";
import { AuthError, ForbiddenError } from "@/lib/errors";

/**
 * 前台 MetaMask 钱包登录(SIWE 风格,简化版):
 * 1. getNonce:按地址查/建用户,生成 nonce 存库,返回待签名消息
 * 2. verifyAndLogin:恢复签名地址比对 + nonce 匹配,通过则轮换 nonce 并签发 JWT
 *
 * 不依赖 session 存储:JWT 无状态,适合 Server Component / Edge。
 */
export class Web3AuthService {
  constructor(
    private readonly users: IUserRepository = createUserRepository(),
  ) {}

  async getNonce(
    walletAddress: string,
  ): Promise<{ nonce: string; message: string }> {
    const address = walletAddress.toLowerCase();
    const nonce = generateNonce();
    const user = await this.users.findOrCreateByWalletAddress(address, nonce);
    const storedNonce = user.nonce ?? nonce;
    return { nonce: storedNonce, message: buildNonceMessage(storedNonce) };
  }

  async verifyAndLogin(
    walletAddress: string,
    signature: string,
  ): Promise<string> {
    const address = walletAddress.toLowerCase();
    const user = await this.users.findByWalletAddress(address);
    if (!user) throw new AuthError("请先获取 nonce");

    if (user.status !== USER_STATUS.ACTIVE) {
      throw new ForbiddenError("账号已被禁用");
    }

    const message = buildNonceMessage(user.nonce ?? "");
    const recovered = recoverSignerAddress(message, signature);
    if (recovered !== address) {
      throw new AuthError("签名验证失败");
    }

    // 轮换 nonce,防止签名被重放
    await this.users.updateNonce(user.id, generateNonce());

    return signUserToken({
      type: "user",
      userId: user.id,
      walletAddress: address,
    });
  }
}
