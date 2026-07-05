import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { CartService } from "@/modules/trade/service/cart.service";
import { Button } from "@/components/ui/button";
import { CartItemActions } from "@/components/storefront/cart-item-actions";

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        请先在右上角完成 <strong>钱包登录</strong>
      </div>
    );
  }

  const service = new CartService();
  const cart = await service.getMyCart(user.userId);
  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        购物车空空如也,{" "}
        <Link href="/products" className="text-primary underline">
          去逛逛
        </Link>
      </div>
    );
  }

  const total = items.reduce(
    (s, i) => s + Number(i.sku.price) * i.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">购物车</h1>
      <div className="space-y-3">
        {items.map((i) => (
          <div
            key={i.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex-1">
              <Link
                href={`/products/${i.product.slug}`}
                className="font-medium hover:underline"
              >
                {i.product.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {i.sku.name ?? i.sku.skuCode}
              </p>
              <p className="mt-1 text-sm">
                ¥{i.sku.price.toString()} × {i.quantity}
              </p>
            </div>
            <CartItemActions itemId={i.id} quantity={i.quantity} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <span className="text-lg">
          合计: <strong>¥{total.toFixed(2)}</strong>
        </span>
        <Link href="/checkout">
          <Button>去结算</Button>
        </Link>
      </div>
    </div>
  );
}
