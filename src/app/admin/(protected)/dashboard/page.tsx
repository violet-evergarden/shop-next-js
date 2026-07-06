import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const [productCount, orderCount, userCount, orders] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.order.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.order.findMany({
      where: { deletedAt: null, status: { in: ["paid", "shipped", "completed"] } },
      select: { payAmount: true },
    }),
  ]);
  const totalSales = orders.reduce((s, o) => s + Number(o.payAmount), 0);
  const stats = [
    { label: "商品总数", value: productCount },
    { label: "订单总数", value: orderCount },
    { label: "会员总数", value: userCount },
    { label: "销售额(元)", value: totalSales.toFixed(2) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
