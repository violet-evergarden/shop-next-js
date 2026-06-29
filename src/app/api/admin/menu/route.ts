import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireAdmin } from "@/lib/auth/session";
import { PermissionService } from "@/modules/rbac/service/permission.service";

/** 当前管理员的菜单树(由 Permission 表动态生成) */
export const GET = withErrorHandler(async () => {
  const admin = await requireAdmin();
  const service = new PermissionService();
  const menuTree = await service.getAdminMenuTree(admin.adminId);
  return ApiResponse.ok(menuTree);
});
