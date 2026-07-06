import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

/** 后台 Dashboard 统计 */
export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const [
    productCount,
    orderCount,
    userCount,
    orders,
  ] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.order.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.order.findMany({
      where: { deletedAt: null, status: { in: ["paid", "shipped", "completed"] } },
      select: { payAmount: true, createdAt: true, status: true },
    }),
  ]);

  const totalSales = orders.reduce((s, o) => s + Number(o.payAmount), 0);
  const pendingPayment = await prisma.order.count({ where: { status: "pending_payment", deletedAt: null } });
  const paid = await prisma.order.count({ where: { status: "paid", deletedAt: null } });
  const shipped = await prisma.order.count({ where: { status: "shipped", deletedAt: null } });
  const completed = await prisma.order.count({ where: { status: "completed", deletedAt: null } });

  // 近 7 天每日销售额
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentOrders = orders.filter((o) => o.createdAt >= sevenDaysAgo);
  const dailySales: { date: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const amount = recentOrders
      .filter((o) => o.createdAt.toISOString().slice(0, 10) === dateStr)
      .reduce((s, o) => s + Number(o.payAmount), 0);
    dailySales.push({ date: dateStr, amount });
  }

  return ApiResponse.ok({
    productCount,
    orderCount,
    userCount,
    totalSales,
    orderStatus: { pendingPayment, paid, shipped, completed },
    dailySales,
  });
});
