import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { ProductService } from "@/modules/catalog/service/product.service";

/** 分类导航 */
export const GET = withErrorHandler(async () => {
  const service = new ProductService();
  return ApiResponse.ok(await service.listCategories());
});
