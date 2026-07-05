/**
 * 种子:演示优惠券。幂等。
 * 用法: npx tsx scripts/seed-coupon.ts
 */
import { prisma } from "../src/lib/db";

async function main() {
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      name: "新人立减 10",
      type: "fixed",
      value: 10,
      minAmount: 50,
      totalQuantity: 1000,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "SAVE20PCT" },
    update: {},
    create: {
      code: "SAVE20PCT",
      name: "满 100 打 8 折",
      type: "percentage",
      value: 0.2,
      minAmount: 100,
      maxDiscount: 50,
      totalQuantity: 500,
    },
  });
  console.log("✓ 种子完成:2 张优惠券(WELCOME10 / SAVE20PCT)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
