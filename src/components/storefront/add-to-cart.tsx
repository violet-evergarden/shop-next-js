"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ProductSku } from "@prisma/client";

/** 加购组件:选规格 + 数量 → 调 /cart/items。未登录提示。 */
export function AddToCart({
  productId,
  skus,
}: {
  productId: string;
  productSlug: string;
  skus: (ProductSku & { inventory: { quantity: number } | null })[];
}) {
  const router = useRouter();
  const firstSku = skus[0];
  const [skuId, setSkuId] = useState(firstSku?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  async function add() {
    if (!skuId) return;
    setLoading(true);
    const res = await fetch("/api/storefront/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skuId, productId, quantity }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/cart");
    } else if (res.status === 401) {
      alert("请先在右上角点击「钱包登录」");
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.message ?? "加购失败");
    }
  }

  if (skus.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无规格</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {skus.map((s) => (
          <button
            key={s.id}
            onClick={() => setSkuId(s.id)}
            className={`rounded border px-3 py-1 text-sm ${
              skuId === s.id
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-accent"
            }`}
          >
            {s.name ?? s.skuCode}
            {s.inventory && (
              <span className="ml-1 text-xs opacity-70">
                (库存 {s.inventory.quantity})
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded border">
          <button
            className="px-3 py-1"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-10 text-center text-sm">{quantity}</span>
          <button
            className="px-3 py-1"
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>
        <Button onClick={add} disabled={loading}>
          {loading ? "加入中…" : "加入购物车"}
        </Button>
      </div>
    </div>
  );
}
