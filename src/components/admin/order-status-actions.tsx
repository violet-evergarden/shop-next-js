"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** 订单状态可流转的下一步 */
const TRANSITIONS: Record<string, { label: string; to: string }[]> = {
  pending_payment: [
    { label: "标记已付款", to: "paid" },
    { label: "取消", to: "cancelled" },
  ],
  paid: [
    { label: "发货", to: "shipped" },
    { label: "退款", to: "refunded" },
  ],
  shipped: [{ label: "完成", to: "completed" }],
};

/** 订单状态流转按钮(终态不显示) */
export function OrderStatusActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [loadingTo, setLoadingTo] = useState<string | null>(null);
  const actions = TRANSITIONS[status] ?? [];

  async function update(to: string) {
    if (!confirm(`确认将订单改为「${to}」?`)) return;
    setLoadingTo(to);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: to }),
    });
    setLoadingTo(null);
    if (res.ok) {
      router.refresh();
    } else {
      alert("操作失败");
    }
  }

  if (actions.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex gap-1">
      {actions.map((a) => (
        <Button
          key={a.to}
          size="sm"
          variant="outline"
          onClick={() => update(a.to)}
          disabled={loadingTo !== null}
        >
          {loadingTo === a.to ? "处理中…" : a.label}
        </Button>
      ))}
    </div>
  );
}
