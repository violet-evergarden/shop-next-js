/**
 * 购物车 + 订单 Service 验证(含越权防护)。
 * 用法: npx tsx scripts/verify-cart.ts  (前置: seed-catalog)
 */
import { CartService } from "../src/modules/trade/service/cart.service";
import { OrderService } from "../src/modules/trade/service/order.service";
import { prisma } from "../src/lib/db";

async function main() {
  const user = await prisma.user.create({
    data: { walletAddress: "0x" + Math.random().toString(36).slice(2), username: "购物车测试" },
  });
  const address = await prisma.address.create({
    data: { userId: user.id, receiver: "李四", phone: "13900000000", province: "广东省", city: "深圳市", district: "福田区", detail: "测试路1号", isDefault: true },
  });
  const sku = await prisma.productSku.findFirst({ where: { skuCode: "DEMO-128" } });
  if (!sku) throw new Error("请先 npx tsx scripts/seed-catalog.ts");

  const cartService = new CartService();
  const orderService = new OrderService();

  await cartService.addItem(user.id, { skuId: sku.id, productId: sku.productId, quantity: 2 });
  console.log("✓ 加购 ×2");

  await cartService.addItem(user.id, { skuId: sku.id, productId: sku.productId, quantity: 1 });
  let cart = await cartService.getMyCart(user.id);
  console.log("✓ 同 SKU 累加后数量:", cart?.items[0]?.quantity, "(期望 3)");

  const itemId = cart?.items[0]?.id;
  if (!itemId) throw new Error("购物车项缺失");
  await cartService.setItemQuantity(user.id, itemId, 5);
  cart = await cartService.getMyCart(user.id);
  console.log("✓ 改数量后:", cart?.items[0]?.quantity, "(期望 5)");

  const order = await orderService.checkout(user.id, { addressId: address.id });
  console.log("✓ 下单:", order.orderNo, "实付", order.payAmount, "(5×6999=34995,满99免邮)");

  const orders = await orderService.listMyOrders(user.id, { page: 1, pageSize: 10 });
  console.log("✓ 我的订单:", orders.total, "条");
  const myOrder = orders.items[0];
  if (!myOrder) throw new Error("订单缺失");
  const detail = await orderService.getMyOrder(user.id, myOrder.id);
  console.log("✓ 订单详情项数:", detail.items.length, "| 状态:", detail.status);

  // 越权:另一个用户查不到此订单
  const other = await prisma.user.create({ data: { walletAddress: "0x" + Math.random().toString(36).slice(2) } });
  try {
    await orderService.getMyOrder(other.id, myOrder.id);
    console.log("✗ 越权查询未被拦截");
  } catch (e) {
    console.log("✓ 越权查询被拦截:", (e as Error).message);
  }

  await prisma.orderItem.deleteMany({ where: { order: { userId: { in: [user.id, other.id] } } } });
  await prisma.order.deleteMany({ where: { userId: { in: [user.id, other.id] } } });
  await prisma.user.deleteMany({ where: { id: { in: [user.id, other.id] } } });
  console.log("✓ 清理完成");
}

main().catch((e) => {
  console.error("✗ 失败:", e);
  process.exit(1);
});
