import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { NotFoundError } from "@/lib/errors";
import { ProductService } from "@/modules/catalog/service/product.service";

/** 商品详情 */
export const GET = withErrorHandler(async (_req, ctx) => {
  const { slug } = await ctx.params;
  const slugStr = Array.isArray(slug) ? slug[0] : slug;
  if (!slugStr) throw new NotFoundError("商品不存在");
  const service = new ProductService();
  return ApiResponse.ok(await service.getDetail(slugStr));
});
