/**
 * Web3 钱包登录端到端验证(用 ethers 随机钱包模拟 MetaMask)。
 * 跑通 getNonce → sign → verifyAndLogin → 验证 token → 错误签名应被拒。
 * 用法: npx tsx scripts/verify-web3-auth.ts
 */
import { ethers } from "ethers";
import { Web3AuthService } from "../src/modules/member/service/auth.service";
import { verifyToken } from "../src/lib/auth/jwt";
import { prisma } from "../src/lib/db";

async function main() {
  const service = new Web3AuthService();
  const wallet = ethers.Wallet.createRandom();
  console.log("模拟钱包地址:", wallet.address);

  // 1. getNonce
  const { message } = await service.getNonce(wallet.address);
  console.log("✓ getNonce 返回签名消息");

  // 2. 模拟 MetaMask personal_sign
  const signature = await wallet.signMessage(message);
  console.log("✓ 钱包签名完成");

  // 3. verifyAndLogin
  const token = await service.verifyAndLogin(wallet.address, signature);
  console.log("✓ verifyAndLogin 签发 JWT");

  // 4. 解析 token
  const payload = await verifyToken<{
    type: string;
    userId: string;
    walletAddress: string;
  }>(token);
  console.log(
    "✓ token 解析:",
    JSON.stringify({ type: payload.type, walletAddress: payload.walletAddress }),
  );
  console.log("✓ 钱包地址匹配:", payload.walletAddress === wallet.address.toLowerCase());

  // 5. 错误用例:用另一个钱包的签名应被拒
  const badWallet = ethers.Wallet.createRandom();
  const badSig = await badWallet.signMessage(message);
  try {
    await service.verifyAndLogin(wallet.address, badSig);
    console.log("✗ 错误签名未被拒绝(逻辑有误)");
  } catch (e) {
    console.log("✓ 错误签名被正确拒绝:", (e as Error).message);
  }

  // 清理测试用户
  await prisma.user.deleteMany({
    where: { walletAddress: wallet.address.toLowerCase() },
  });
  console.log("✓ 清理完成");
}

main().catch((e) => {
  console.error("✗ 验证失败:", e);
  process.exit(1);
});
