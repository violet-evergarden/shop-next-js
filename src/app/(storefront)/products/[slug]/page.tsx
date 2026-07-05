import { notFound } from "next/navigation";
import { ProductService } from "@/modules/catalog/service/product.service";
import { AddToCart } from "@/components/storefront/add-to-cart";
import { FavoriteButton } from "@/components/storefront/favorite-button";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = new ProductService();
  const product = await service.getDetail(slug).catch(() => null);
  if (!product) notFound();

  const cover =
    product.images.find((i) => i.isCover)?.url ?? product.images[0]?.url;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-lg bg-muted">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={product.name}
              className="h-full w-full rounded-lg object-cover"
            />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          {product.subtitle && (
            <p className="mt-1 text-muted-foreground">{product.subtitle}</p>
          )}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              ¥{product.price.toString()}
            </span>
            {product.originalPrice && (
              <span className="text-muted-foreground line-through">
                ¥{product.originalPrice.toString()}
              </span>
            )}
          </div>
          {product.description && (
            <p className="mt-4 whitespace-pre-wrap text-sm">
              {product.description}
            </p>
          )}
          <div className="mt-6 space-y-3">
            <AddToCart
              productId={product.id}
              productSlug={product.slug}
              skus={product.skus.map((s) => ({
                id: s.id,
                name: s.name,
                skuCode: s.skuCode,
                price: Number(s.price),
                isActive: s.isActive,
                inventory: s.inventory ? { quantity: s.inventory.quantity } : null,
              }))}
            />
            <FavoriteButton productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
