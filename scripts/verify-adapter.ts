/**
 * Prisma 7 driver adapter 运行时验证:确认 db.ts 按 DATABASE_PROVIDER 正确连库。
 * 用法: npx tsx scripts/verify-adapter.ts
 */
import { prisma } from "../src/lib/db";

async function main() {
  const productCount = await prisma.product.count();
  const adminCount = await prisma.admin.count();
  console.log("✓ adapter 连接成功");
  console.log("  provider:", process.env.DATABASE_PROVIDER);
  console.log("  商品数:", productCount, "| 管理员数:", adminCount);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("✗ adapter 验证失败:", e);
  process.exit(1);
});
