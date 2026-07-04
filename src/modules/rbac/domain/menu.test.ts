import { describe, it, expect } from "vitest";
import { buildMenuTree } from "./menu";
import type { Permission } from "@prisma/client";

const base = {
  name: "n",
  code: "c",
  type: "menu",
  path: "/p",
  icon: null,
  component: null,
  sortOrder: 0,
  isVisible: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
} as const;

const perm = (over: Partial<Permission>): Permission =>
  ({ ...base, id: "1", parentId: null, ...over }) as Permission;

describe("buildMenuTree", () => {
  it("扁平列表转树", () => {
    const tree = buildMenuTree([
      perm({ id: "1", name: "父" }),
      perm({ id: "2", parentId: "1", name: "子" }),
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.children).toHaveLength(1);
    expect(tree[0]?.children[0]?.name).toBe("子");
  });

  it("按 sortOrder 升序", () => {
    const tree = buildMenuTree([
      perm({ id: "1", sortOrder: 2 }),
      perm({ id: "2", sortOrder: 1 }),
    ]);
    expect(tree[0]?.id).toBe("2");
    expect(tree[1]?.id).toBe("1");
  });

  it("孤儿子菜单提到根级", () => {
    const tree = buildMenuTree([
      perm({ id: "1", parentId: "不存在", name: "孤儿" }),
    ]);
    expect(tree).toHaveLength(1);
  });

  it("子节点也按 sortOrder 排序", () => {
    const tree = buildMenuTree([
      perm({ id: "p", name: "父" }),
      perm({ id: "c1", parentId: "p", sortOrder: 3 }),
      perm({ id: "c2", parentId: "p", sortOrder: 1 }),
    ]);
    expect(tree[0]?.children.map((c) => c.id)).toEqual(["c2", "c1"]);
  });
});
