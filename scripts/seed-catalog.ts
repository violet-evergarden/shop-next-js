/**
 * 种子:演示分类 + 商品(含 SKU/库存/图片)。幂等。
 * 用法: npx tsx scripts/seed-catalog.ts
 */
import { prisma } from "../src/lib/db";

async function main() {
  const phone = await prisma.category.upsert({
    where: { code: "phone" },
    create: { code: "phone", name: "手机", sortOrder: 1 },
    update: {},
  });
  const acc = await prisma.category.upsert({
    where: { code: "accessory" },
    create: { code: "accessory", name: "配件", sortOrder: 2 },
    update: {},
  });

  const p1 = await prisma.product.upsert({
    where: { slug: "demo-phone-pro" },
    update: {},
    create: {
      name: "演示手机 Pro",
      slug: "demo-phone-pro",
      categoryId: phone.id,
      price: 6999,
      originalPrice: 7999,
      status: "active",
      isActive: true,
      subtitle: "旗舰演示款",
      description: "用于演示商城流程的商品",
      skus: {
        create: [
          { skuCode: "DEMO-128", name: "128G 黑色", price: 6999, isActive: true },
          { skuCode: "DEMO-256", name: "256G 黑色", price: 7499, isActive: true },
        ],
      },
      images: {
        create: [
          { url: "https://picsum.photos/seed/demophone/600", alt: "主图", isCover: true, sortOrder: 1 },
        ],
      },
    },
    include: { skus: true },
  });
  for (const sku of p1.skus) {
    await prisma.inventory.upsert({
      where: { skuId: sku.id },
      create: { skuId: sku.id, productId: p1.id, quantity: 50 },
      update: {},
    });
  }

  const p2 = await prisma.product.upsert({
    where: { slug: "demo-case" },
    update: {},
    create: {
      name: "演示手机壳",
      slug: "demo-case",
      categoryId: acc.id,
      price: 49,
      status: "active",
      isActive: true,
      skus: {
        create: [{ skuCode: "CASE-BLUE", name: "蓝色", price: 49, isActive: true }],
      },
    },
    include: { skus: true },
  });
  for (const sku of p2.skus) {
    await prisma.inventory.upsert({
      where: { skuId: sku.id },
      create: { skuId: sku.id, productId: p2.id, quantity: 200 },
      update: {},
    });
  }

  console.log("✓ 种子完成:2 分类 + 2 商品(demo-phone-pro / demo-case)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
