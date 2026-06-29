/**
 * 开发工具:签发测试前台用户 token。
 * 会在 db 里 upsert 一个测试用户(加购/下单等操作依赖真实 userId 的外键)。
 * 用法: npx tsx scripts/mint-token.ts
 */
import { signUserToken } from "../src/lib/auth/jwt";
import { prisma } from "../src/lib/db";

async function main() {
  const user = await prisma.user.upsert({
    where: { walletAddress: "0xtestuser" },
    create: { walletAddress: "0xtestuser", username: "测试用户" },
    update: {},
  });
  const token = await signUserToken({
    type: "user",
    userId: user.id,
    walletAddress: "0xtestuser",
  });
  console.log(token);
}

main();
