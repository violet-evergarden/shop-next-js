import { ProductService } from "@/modules/catalog/service/product.service";
import { BannerService } from "@/modules/content/service/banner.service";
import { ProductCard } from "@/components/storefront/product-card";

export default async function HomePage() {
  const productService = new ProductService();
  const bannerService = new BannerService();
  const [{ items }, banners] = await Promise.all([
    productService.list({ page: 1, pageSize: 12 }),
    bannerService.listActive(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {banners.length > 0 ? (
        <div className="mb-8 space-y-2">
          {banners.map((b) => (
            <a key={b.id} href={b.link ?? "#"} className="block overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.image}
                alt={b.title}
                className="h-48 w-full object-cover md:h-64"
              />
            </a>
          ))}
        </div>
      ) : (
        <div className="mb-8 rounded-lg bg-gradient-to-r from-primary to-primary/70 p-8 text-primary-foreground">
          <h1 className="text-3xl font-bold">新品上架</h1>
          <p className="mt-2 opacity-90">钱包登录即购,Web3 原生商城体验</p>
        </div>
      )}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">热门商品</h2>
        <a href="/products" className="text-sm text-primary hover:underline">
          查看全部 →
        </a>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
