import type { Permission } from "@prisma/client";

/** 前端菜单节点(由 Permission 中 type=menu 的记录聚合而来) */
export interface MenuNode {
  id: string;
  name: string;
  path: string | null;
  icon: string | null;
  component: string | null;
  sortOrder: number;
  children: MenuNode[];
}

/**
 * 把扁平的菜单权限列表构建成树。纯函数,可独立单测。
 * 孤儿子菜单(父不在列表中)会被提到根级,前端可自行处理。
 */
export function buildMenuTree(permissions: Permission[]): MenuNode[] {
  const nodes = new Map<string, MenuNode>();
  for (const p of permissions) {
    nodes.set(p.id, {
      id: p.id,
      name: p.name,
      path: p.path,
      icon: p.icon,
      component: p.component,
      sortOrder: p.sortOrder,
      children: [],
    });
  }

  const roots: MenuNode[] = [];
  for (const p of permissions) {
    const node = nodes.get(p.id);
    if (!node) continue;
    const parent = p.parentId ? nodes.get(p.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortRec = (list: MenuNode[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
    for (const n of list) sortRec(n.children);
  };
  sortRec(roots);
  return roots;
}
