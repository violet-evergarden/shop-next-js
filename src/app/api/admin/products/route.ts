import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireAdmin } from "@/lib/auth/session";
import { ProductService } from "@/modules/catalog/service/product.service";
import { productQuerySchema } from "@/modules/catalog/domain/product";

/** 后台商品列表(含全部状态) */
export const GET = withErrorHandler(async (req) => {
  await requireAdmin();
  const sp = req.nextUrl.searchParams;
  const query = productQuerySchema.parse({
    keyword: sp.get("keyword") ?? undefined,
    categoryId: sp.get("categoryId") ?? undefined,
    brandId: sp.get("brandId") ?? undefined,
    status: sp.get("status") ?? undefined,
    page: Number(sp.get("page") ?? 1),
    pageSize: Number(sp.get("pageSize") ?? 20),
  });
  const service = new ProductService();
  return ApiResponse.ok(await service.listAll(query));
});
