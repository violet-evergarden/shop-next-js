import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { AnnouncementService } from "@/modules/content/service/announcement.service";

/** 前台:生效中的公告(公开) */
export const GET = withErrorHandler(async () => {
  const service = new AnnouncementService();
  return ApiResponse.ok(await service.listActive());
});
