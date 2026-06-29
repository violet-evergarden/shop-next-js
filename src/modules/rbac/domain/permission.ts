/** 权限/资源类型 —— Permission 表同时承担菜单定义(type=menu)与操作点(type=action/api) */
export const PERMISSION_TYPE = {
  MENU: "menu",
  ACTION: "action",
  API: "api",
} as const;
export type PermissionType = (typeof PERMISSION_TYPE)[keyof typeof PERMISSION_TYPE];
