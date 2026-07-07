import type { Admin, AdminRole, Role } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";

export type AdminWithRoles = Admin & {
  roles: (AdminRole & { role: Role })[];
};

export interface IAdminRepository {
  findById(id: string, ctx?: RepoContext): Promise<Admin | null>;
  findByUsername(username: string, ctx?: RepoContext): Promise<Admin | null>;
  updateLastLogin(
    id: string,
    ip: string | null,
    ctx?: RepoContext,
  ): Promise<void>;
  /** 全部管理员(含角色),后台管理页 */
  findAllWithRoles(ctx?: RepoContext): Promise<AdminWithRoles[]>;
}
