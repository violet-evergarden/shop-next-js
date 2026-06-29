import { requireAdmin } from "@/lib/auth/session";
import { PermissionService } from "@/modules/rbac/service/permission.service";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

/**
 * 受保护的后台区域。middleware 已拦截未登录,
 * 到这里的请求一定持有有效 admin token。
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  const service = new PermissionService();
  const menu = await service.getAdminMenuTree(admin.adminId);
  return (
    <div className="flex min-h-screen">
      <AdminSidebar menu={menu} username={admin.username} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
