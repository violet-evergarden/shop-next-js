import type { Permission } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";

export interface IPermissionRepository {
  /** 聚合某 admin(经角色)拥有的全部权限 */
  findByAdminId(adminId: string, ctx?: RepoContext): Promise<Permission[]>;
  /** 某 admin 拥有的菜单权限(type=menu,可见且启用) */
  findMenusByAdminId(
    adminId: string,
    ctx?: RepoContext,
  ): Promise<Permission[]>;
}
