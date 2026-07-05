import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

/** 管理员列表(含角色) */
export const GET = withErrorHandler(async () => {
  await requireAdmin();
  const admins = await prisma.admin.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: { roles: { include: { role: true } } },
  });
  return ApiResponse.ok(admins);
});
