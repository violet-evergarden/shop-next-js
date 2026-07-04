import { ProductService } from "@/modules/catalog/service/product.service";
import { ProductCard } from "@/components/storefront/product-card";
import { SearchBox } from "@/components/storefront/search-box";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string; category?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const service = new ProductService();
  const { items, total, page, totalPages } = await service.list({
    page: Number(sp.page ?? 1),
    pageSize: 12,
    keyword: sp.keyword,
    categoryId: sp.category,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">商品列表</h1>
      <SearchBox initialKeyword={sp.keyword ?? ""} />
      <p className="mt-2 text-sm text-muted-foreground">共 {total} 件商品</p>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/products?page=${p}${sp.keyword ? `&keyword=${sp.keyword}` : ""}`}
              className={`rounded border px-3 py-1 text-sm ${
                p === page ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
