import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { ProductService } from "@/modules/catalog/service/product.service";
import { productQuerySchema } from "@/modules/catalog/domain/product";

/** 商品列表(支持 keyword/categoryId/brandId/page/pageSize) */
export const GET = withErrorHandler(async (req) => {
  const sp = req.nextUrl.searchParams;
  const query = productQuerySchema.parse({
    keyword: sp.get("keyword") ?? undefined,
    categoryId: sp.get("categoryId") ?? undefined,
    brandId: sp.get("brandId") ?? undefined,
    page: Number(sp.get("page") ?? 1),
    pageSize: Number(sp.get("pageSize") ?? 20),
  });
  const service = new ProductService();
  return ApiResponse.ok(await service.list(query));
});
