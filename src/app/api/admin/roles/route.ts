import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireAdmin } from "@/lib/auth/session";
import { RoleService } from "@/modules/rbac/service/role.service";

/** 角色列表 */
export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const service = new RoleService();
  return ApiResponse.ok(await service.list());
});
