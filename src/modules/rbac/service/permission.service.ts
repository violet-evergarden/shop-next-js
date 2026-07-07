import type { Permission } from "@prisma/client";
import type { IPermissionRepository } from "../repository";
import { createPermissionRepository } from "../repository";
import { buildMenuTree, type MenuNode } from "../domain/menu";

/**
 * 权限/菜单服务。
 * 菜单完全由 Permission 表动态生成,不硬编码 —— 这就是"菜单自动生成 + RBAC"的落点。
 */
export class PermissionService {
  constructor(
    private readonly perms: IPermissionRepository = createPermissionRepository(),
  ) {}

  /** 某 admin 的全部权限码(供接口/按钮级鉴权用) */
  async getAdminPermissions(adminId: string): Promise<Permission[]> {
    return this.perms.findByAdminId(adminId);
  }

  /** 某 admin 的菜单树(供后台侧边栏动态渲染) */
  async getAdminMenuTree(adminId: string): Promise<MenuNode[]> {
    const menus = await this.perms.findMenusByAdminId(adminId);
    return buildMenuTree(menus);
  }

  /** 全部权限列表(后台管理页) */
  async listAll(): Promise<Permission[]> {
    return this.perms.findAll();
  }
}
