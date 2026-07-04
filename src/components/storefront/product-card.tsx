import Link from "next/link";
import type { Product } from "@prisma/client";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="block rounded-lg border p-3 transition hover:shadow-md"
    >
      <div className="mb-2 aspect-square rounded bg-muted" />
      <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-lg font-bold">¥{product.price.toString()}</span>
        {product.originalPrice && (
          <span className="text-xs text-muted-foreground line-through">
            ¥{product.originalPrice.toString()}
          </span>
        )}
      </div>
    </Link>
  );
}
