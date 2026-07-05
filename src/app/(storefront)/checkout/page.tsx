import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { CartService } from "@/modules/trade/service/cart.service";
import { AddressService } from "@/modules/member/service/address.service";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        请先在右上角完成 <strong>钱包登录</strong>
      </div>
    );
  }

  const cartService = new CartService();
  const addressService = new AddressService();
  const [cart, addresses] = await Promise.all([
    cartService.getMyCart(user.userId),
    addressService.listMy(user.userId),
  ]);
  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        购物车为空,{" "}
        <Link href="/products" className="text-primary underline">
          去选购
        </Link>
      </div>
    );
  }

  const lines = items.map((i) => ({
    name: i.product.name,
    skuName: i.sku.name,
    price: Number(i.sku.price),
    quantity: i.quantity,
  }));
  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const addressList = addresses.map((a) => ({
    id: a.id,
    receiver: a.receiver,
    phone: a.phone,
    address: `${a.province}${a.city}${a.district}${a.detail}`,
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">确认订单</h1>
      <CheckoutForm lines={lines} addresses={addressList} total={total} />
    </div>
  );
}
