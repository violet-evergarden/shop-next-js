import { ProductService } from "@/modules/catalog/service/product.service";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const service = new ProductService();
  const categories = await service.listCategories();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">新增商品</h1>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
