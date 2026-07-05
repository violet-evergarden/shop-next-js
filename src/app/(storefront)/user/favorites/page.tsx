import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { FavoriteService } from "@/modules/member/service/favorite.service";
import { ProductCard } from "@/components/storefront/product-card";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        请先在右上角完成 <strong>钱包登录</strong>
      </div>
    );
  }

  const service = new FavoriteService();
  const favorites = await service.listMy(user.userId);
  const products = favorites
    .map((f) => f.product)
    .filter((p) => p && !p.deletedAt);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">我的收藏</h1>
      {products.length === 0 ? (
        <p className="text-muted-foreground">
          暂无收藏,{" "}
          <Link href="/products" className="text-primary underline">
            去逛逛
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
