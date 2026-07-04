import Link from "next/link";
import { OrderService } from "@/modules/trade/service/order.service";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_TABS = [
  { key: "", label: "全部" },
  { key: "pending_payment", label: "待付款" },
  { key: "paid", label: "已付款" },
  { key: "shipped", label: "已发货" },
  { key: "completed", label: "已完成" },
  { key: "refunded", label: "已退款" },
];

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "待付款",
  paid: "已付款",
  shipped: "已发货",
  completed: "已完成",
  refunded: "已退款",
  cancelled: "已取消",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "";
  const service = new OrderService();
  const { items, total } = await service.listAll({
    page: 1,
    pageSize: 50,
    status: status || undefined,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        订单管理
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          共 {total} 条
        </span>
      </h1>
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/admin/orders?status=${t.key}` : "/admin/orders"}
            className={`rounded border px-3 py-1 text-sm ${
              status === t.key
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>用户</TableHead>
              <TableHead>实付</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.orderNo}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {o.user?.walletAddress
                    ? `${o.user.walletAddress.slice(0, 8)}…`
                    : "-"}
                </TableCell>
                <TableCell>¥{o.payAmount.toString()}</TableCell>
                <TableCell>{STATUS_LABEL[o.status] ?? o.status}</TableCell>
                <TableCell>
                  <OrderStatusActions orderId={o.id} status={o.status} />
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  暂无订单
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
