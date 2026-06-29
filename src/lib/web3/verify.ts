import { ethers } from "ethers";

/**
 * 从 MetaMask personal_sign(EIP-191)签名中恢复签名者地址。
 * 返回小写地址,便于与库中存储的 walletAddress 比对。
 */
export function recoverSignerAddress(
  message: string,
  signature: string,
): string {
  return ethers.verifyMessage(message, signature).toLowerCase();
}
