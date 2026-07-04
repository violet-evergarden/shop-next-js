import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { BannerService } from "@/modules/content/service/banner.service";

/** 前台:生效中的 Banner(公开) */
export const GET = withErrorHandler(async () => {
  const service = new BannerService();
  return ApiResponse.ok(await service.listActive());
});
