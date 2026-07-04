/**
 * 种子:演示 Banner。幂等(按 title 判断)。
 * 用法: npx tsx scripts/seed-banner.ts
 */
import { prisma } from "../src/lib/db";

async function ensure(title: string, image: string, link: string, sortOrder: number) {
  const existing = await prisma.banner.findFirst({ where: { title } });
  if (!existing) {
    await prisma.banner.create({
      data: { title, image, link, sortOrder, isActive: true },
    });
  }
}

async function main() {
  await ensure("新人专享", "https://picsum.photos/seed/shop1/1200/400", "/products", 1);
  await ensure("限时特惠", "https://picsum.photos/seed/shop2/1200/400", "/products", 2);
  console.log("✓ 种子完成:2 个 Banner(新人专享 / 限时特惠)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
