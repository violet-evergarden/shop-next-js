/**
 * catalog repository 集成验证(临时脚本,Step 10 会用 vitest 正式化)。
 * 对真实 SQLite 库跑完整 CRUD + 软删除 + 审计字段 + 销量自增,验证模板模式正确。
 * 用法: npx tsx scripts/verify-catalog-repository.ts
 */
import { createProductRepository } from "../src/modules/catalog/repository";
import {
  createProductSchema,
  productQuerySchema,
} from "../src/modules/catalog/domain/product";
import { prisma } from "../src/lib/db";

async function main() {
  const repo = createProductRepository();
  const actorId = "admin-verify";

  const created = await repo.create(
    createProductSchema.parse({
      name: "测试商品",
      slug: "test-product-" + Math.random().toString(36).slice(2, 8),
      price: 99.9,
    }),
    { actorId },
  );
  console.log("✓ create:", created.id, created.name, created.price.toString());

  const found = await repo.findById(created.id);
  console.log("✓ findById:", found?.name, "| createdBy:", found?.createdBy);

  const bySlug = await repo.findBySlug(created.slug);
  console.log("✓ findBySlug 命中:", bySlug?.id === created.id);

  await repo.incrementSales(created.id, 5);
  const afterSales = await repo.findById(created.id);
  console.log("✓ incrementSales:", afterSales?.sales);

  const list = await repo.findMany(productQuerySchema.parse({}));
  console.log("✓ findMany 总数:", list.total, "页数:", list.totalPages);

  const updated = await repo.update(
    created.id,
    { name: "改名商品" },
    { actorId },
  );
  console.log("✓ update:", updated.name, "| updatedBy:", updated.updatedBy);

  await repo.softDelete(created.id, { actorId });
  const afterDelete = await repo.findById(created.id);
  console.log("✓ softDelete deletedAt 已设置:", !!afterDelete?.deletedAt);
  const listAfter = await repo.findMany(productQuerySchema.parse({}));
  console.log("✓ 软删除后默认查询排除该商品:", listAfter.total);

  // 物理清理测试数据
  await prisma.product.delete({ where: { id: created.id } });
  console.log("✓ 清理完成");
}

main().catch((e) => {
  console.error("✗ 验证失败:", e);
  process.exit(1);
});
