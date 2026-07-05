import Link from "next/link";
import { WalletLogin } from "@/components/storefront/wallet-login";
import { AnnouncementService } from "@/modules/content/service/announcement.service";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const announcementService = new AnnouncementService();
  const announcements = await announcementService.listActive();

  return (
    <div className="flex min-h-screen flex-col">
      {announcements.length > 0 && (
        <div className="bg-primary px-4 py-2 text-center text-sm text-primary-foreground">
          {announcements.map((a) => a.title).join("  |  ")}
        </div>
      )}
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
            <Link href="/user/coupons" className="hover:underline">
              优惠券
            </Link>
            <Link href="/user/favorites" className="hover:underline">
              收藏
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
