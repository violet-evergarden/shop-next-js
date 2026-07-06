"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** 模拟支付按钮 */
export function PayButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function pay() {
    if (!confirm("确认支付?(模拟支付,直接标记为已付款)")) return;
    setLoading(true);
    const res = await fetch(`/api/storefront/orders/${orderId}/pay`, {
      method: "POST",
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.message ?? "支付失败");
    }
  }

  return (
    <Button onClick={pay} disabled={loading}>
      {loading ? "支付中…" : "立即支付"}
    </Button>
  );
}
