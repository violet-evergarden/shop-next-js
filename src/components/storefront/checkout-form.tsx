"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Line {
  name: string;
  skuName: string | null;
  price: number;
  quantity: number;
}
interface Address {
  id: string;
  receiver: string;
  phone: string;
  address: string;
}

export function CheckoutForm({
  lines,
  addresses,
  total,
}: {
  lines: Line[];
  addresses: Address[];
  total: number;
}) {
  const router = useRouter();
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!addressId) {
      setError("请选择收货地址");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/storefront/orders/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/user/orders");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.message ?? "下单失败");
    }
  }

  if (addresses.length === 0) {
    return (
      <p className="text-muted-foreground">
        请先{" "}
      <a className="text-primary underline" href="/user/addresses">
          添加收货地址
        </a>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-medium">选择收货地址</h2>
        <div className="space-y-2">
          {addresses.map((a) => (
            <label
              key={a.id}
              className={`flex cursor-pointer items-start gap-2 rounded border p-3 ${
                addressId === a.id ? "border-primary" : ""
              }`}
            >
              <input
                type="radio"
                checked={addressId === a.id}
                onChange={() => setAddressId(a.id)}
              />
              <div>
                <div className="text-sm font-medium">
                  {a.receiver} {a.phone}
                </div>
                <div className="text-sm text-muted-foreground">
                  {a.address}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-2 font-medium">商品清单</h2>
        <div className="rounded border">
          {lines.map((l, i) => (
            <div
              key={i}
              className="flex justify-between border-b p-3 text-sm last:border-0"
            >
              <span>
                {l.name}
                {l.skuName && ` (${l.skuName})`} × {l.quantity}
              </span>
              <span>¥{(l.price * l.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between p-3 font-bold">
            合计 <span>¥{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={submit} disabled={loading}>
        {loading ? "提交中…" : "提交订单"}
      </Button>
    </div>
  );
}
