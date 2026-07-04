import Link from "next/link";
import { WalletLogin } from "@/components/storefront/wallet-login";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold">
            商城
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/products" className="hover:underline">
              商品
            </Link>
            <Link href="/cart" className="hover:underline">
              购物车
            </Link>
            <Link href="/user/orders" className="hover:underline">
              我的订单
            </Link>
            <WalletLogin />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        企业级商城 · Next.js 15 + Prisma 7 + DDD
      </footer>
    </div>
  );
}
