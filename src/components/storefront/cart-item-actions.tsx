"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** 购物车项操作:改数量 + 删除 */
export function CartItemActions({
  itemId,
  quantity,
}: {
  itemId: string;
  quantity: number;
}) {
  const router = useRouter();

  async function setQty(q: number) {
    if (q < 1) return;
    await fetch(`/api/storefront/cart/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: q }),
    });
    router.refresh();
  }

  async function remove() {
    if (!confirm("删除该商品?")) return;
    await fetch(`/api/storefront/cart/items/${itemId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded border">
        <button className="px-2 py-0.5" onClick={() => setQty(quantity - 1)}>
          −
        </button>
        <span className="w-8 text-center text-sm">{quantity}</span>
        <button className="px-2 py-0.5" onClick={() => setQty(quantity + 1)}>
          +
        </button>
      </div>
      <Button size="sm" variant="ghost" onClick={remove}>
        删除
      </Button>
    </div>
  );
}
