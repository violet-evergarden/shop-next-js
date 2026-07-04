import type { RouteContext } from "@/lib/http/with-handler";
import { NotFoundError } from "@/lib/errors";
import { ProductService } from "@/modules/catalog/service/product.service";
import {
  ProductForm,
  type ProductFormInitial,
} from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: RouteContext["params"];
}) {
  const { id } = await params;
  const idStr = Array.isArray(id) ? id[0] : id;
  if (!idStr) throw new NotFoundError("商品不存在");

  const service = new ProductService();
  const product = await service.getById(idStr);
  const categories = await service.listCategories();

  const initial: ProductFormInitial = {
    name: product.name,
    slug: product.slug,
    subtitle: product.subtitle ?? "",
    description: product.description ?? "",
    price: Number(product.price),
    originalPrice: product.originalPrice
      ? Number(product.originalPrice)
      : undefined,
    categoryId: product.categoryId ?? "",
    status: product.status,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">编辑商品</h1>
      <ProductForm
        mode="edit"
        productId={idStr}
        initial={initial}
        categories={categories}
      />
    </div>
  );
}
