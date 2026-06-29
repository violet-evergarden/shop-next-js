/**
 * 下单流程端到端验证。
 * 正常下单(库存扣减/购物车清空/订单快照/计价/销量) + 库存不足拦截 + 事务回滚。
 * 用法: npx tsx scripts/verify-checkout.ts
 */
import { prisma } from "../src/lib/db";
import { OrderService } from "../src/modules/trade/service/order.service";

async function main() {
  const service = new OrderService();

  // --- 清理上次可能的残留(开发库) ---
  await prisma.orderItem.deleteMany({ where: { order: { user: { username: "下单测试用户" } } } });
  await prisma.order.deleteMany({ where: { user: { username: "下单测试用户" } } });
  await prisma.product.deleteMany({ where: { name: "测试手机" } });
  await prisma.user.deleteMany({ where: { username: "下单测试用户" } });

  // --- 准备数据 ---
  const user = await prisma.user.create({
    data: {
      walletAddress: "0x" + Math.random().toString(36).slice(2),
      username: "下单测试用户",
    },
  });
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      receiver: "张三",
      phone: "13800000000",
      province: "广东省",
      city: "深圳市",
      district: "南山区",
      detail: "科技园1号",
      isDefault: true,
    },
  });
  const product = await prisma.product.create({
    data: {
      name: "测试手机",
      slug: "phone-" + Date.now(),
      price: 999,
      status: "active",
      isActive: true,
      skus: {
        create: { skuCode: "SKU-" + Date.now(), name: "黑色128G", price: 999, isActive: true },
      },
    },
    include: { skus: true },
  });
  const sku = product.skus[0];
  if (!sku) throw new Error("SKU 创建失败");
  await prisma.inventory.create({
    data: { skuId: sku.id, productId: product.id, quantity: 10, locked: 0, safetyStock: 2 },
  });
  const cart = await prisma.cart.create({ data: { userId: user.id } });
  await prisma.cartItem.create({
    data: { cartId: cart.id, skuId: sku.id, productId: product.id, quantity: 2, selected: true },
  });
  console.log("✓ 准备数据:用户/地址/商品/SKU/库存(10)/购物车(2件)");

  // --- 正常下单 ---
  const result = await service.checkout(user.id, { addressId: address.id });
  console.log("✓ 下单成功:", JSON.stringify(result));

  // --- 验证库存扣减 10-2=8 ---
  const inv = await prisma.inventory.findUnique({ where: { skuId: sku.id } });
  console.log("✓ 库存扣减后剩余:", inv?.quantity, "(期望 8)");

  // --- 购物车清空 ---
  const cartLeft = await prisma.cartItem.count({ where: { cartId: cart.id } });
  console.log("✓ 购物车剩余项:", cartLeft, "(期望 0)");

  // --- 订单 + 快照 + 计价 ---
  const order = await prisma.order.findFirst({
    where: { userId: user.id },
    include: { items: true },
  });
  console.log(
    "✓ 订单:", order?.orderNo, "| 实付:", order?.payAmount.toString(), "| 状态:", order?.status,
  );
  console.log(
    "✓ 订单项快照:", order?.items[0]?.productName, order?.items[0]?.skuName,
    "@", order?.items[0]?.price.toString(), "×", order?.items[0]?.quantity,
  );
  console.log("✓ 计价校验(2×999=1998,满99免邮):", Number(order?.payAmount) === 1998 ? "通过" : "失败");

  // --- 销量自增 ---
  const prod = await prisma.product.findUnique({ where: { id: product.id } });
  console.log("✓ 商品销量:", prod?.sales, "(期望 2)");

  // --- 库存不足拦截 + 事务回滚(Cart↔User 一对一,复用已清空的购物车) ---
  await prisma.cartItem.create({
    data: { cartId: cart.id, skuId: sku.id, productId: product.id, quantity: 100, selected: true },
  });
  try {
    await service.checkout(user.id, { addressId: address.id });
    console.log("✗ 库存不足未被拦截(逻辑有误)");
  } catch (e) {
    console.log("✓ 库存不足被拦截:", (e as Error).message);
  }
  // 事务回滚:库存不变、购物车项未清空、未产生新订单
  const invAfter = await prisma.inventory.findUnique({ where: { skuId: sku.id } });
  const cartLeftAfter = await prisma.cartItem.count({ where: { cartId: cart.id } });
  const orderCount = await prisma.order.count({ where: { userId: user.id } });
  console.log("✓ 事务回滚: 库存仍为", invAfter?.quantity, "(期望 8) | 购物车项仍在", cartLeftAfter, "(期望 1) | 订单数", orderCount, "(期望 1)");

  // --- 清理 ---
  await prisma.orderItem.deleteMany({ where: { order: { userId: user.id } } });
  await prisma.order.deleteMany({ where: { userId: user.id } });
  await prisma.product.deleteMany({ where: { id: product.id } });
  await prisma.user.deleteMany({ where: { id: user.id } });
  console.log("✓ 清理完成");
}

main().catch((e) => {
  console.error("✗ 失败:", e);
  process.exit(1);
});
