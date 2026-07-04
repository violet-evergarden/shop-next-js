import { getCurrentUser } from "@/lib/auth/session";
import { OrderService } from "@/modules/trade/service/order.service";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "待付款",
  paid: "已付款",
  shipped: "已发货",
  completed: "已完成",
  refunded: "已退款",
  cancelled: "已取消",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        请先在右上角完成 <strong>钱包登录</strong>
      </div>
    );
  }

  const service = new OrderService();
  const { items } = await service.listMyOrders(user.userId, {
    page: 1,
    pageSize: 20,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">我的订单</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">暂无订单</p>
      ) : (
        <div className="space-y-3">
          {items.map((o) => (
            <div key={o.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-muted-foreground">
                  {o.orderNo}
                </span>
                <span className="text-sm">
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {o.createdAt.toISOString().slice(0, 10)}
                </span>
                <span className="text-lg font-bold">
                  ¥{o.payAmount.toString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
