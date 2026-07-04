import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

/** 权限/菜单列表(后台查看) */
export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const permissions = await prisma.permission.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return ApiResponse.ok(permissions);
});
