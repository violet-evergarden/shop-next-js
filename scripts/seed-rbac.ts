/**
 * 种子:后台菜单权限 + 超级管理员角色 + 管理员账号。
 * 幂等,可重复执行。用法: npx tsx scripts/seed-rbac.ts
 */
import { prisma } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth/password";

type MenuSeed = {
  code: string;
  name: string;
  path: string;
  icon?: string;
  sortOrder: number;
  parent?: string;
};

const MENUS: MenuSeed[] = [
  { code: "dashboard", name: "仪表盘", path: "/admin/dashboard", icon: "LayoutDashboard", sortOrder: 1 },
  { code: "catalog", name: "商品", path: "/admin/catalog", icon: "Package", sortOrder: 2 },
  { code: "catalog.products", name: "商品列表", path: "/admin/catalog/products", sortOrder: 1, parent: "catalog" },
  { code: "catalog.categories", name: "分类", path: "/admin/catalog/categories", sortOrder: 2, parent: "catalog" },
  { code: "catalog.inventory", name: "库存", path: "/admin/catalog/inventory", sortOrder: 3, parent: "catalog" },
  { code: "orders", name: "订单", path: "/admin/orders", icon: "ShoppingCart", sortOrder: 3 },
  { code: "members", name: "会员", path: "/admin/members", icon: "Users", sortOrder: 4 },
  { code: "content", name: "内容", path: "/admin/content", icon: "Image", sortOrder: 5 },
  { code: "content.banners", name: "Banner", path: "/admin/content/banners", sortOrder: 1, parent: "content" },
  { code: "system", name: "系统", path: "/admin/system", icon: "Settings", sortOrder: 6 },
  { code: "system.admins", name: "管理员", path: "/admin/system/admins", sortOrder: 1, parent: "system" },
  { code: "system.roles", name: "角色", path: "/admin/system/roles", sortOrder: 2, parent: "system" },
  { code: "system.permissions", name: "权限", path: "/admin/system/permissions", sortOrder: 3, parent: "system" },
  { code: "system.operation-logs", name: "操作日志", path: "/admin/system/operation-logs", sortOrder: 4, parent: "system" },
];

async function main() {
  // 1. 菜单权限(按业务 code upsert;先建父再建子以获得 parentId)
  const codeToId = new Map<string, string>();
  for (const m of MENUS) {
    const parentId = m.parent ? (codeToId.get(m.parent) ?? null) : null;
    const perm = await prisma.permission.upsert({
      where: { code: m.code },
      create: {
        code: m.code,
        name: m.name,
        type: "menu",
        path: m.path,
        icon: m.icon ?? null,
        sortOrder: m.sortOrder,
        isVisible: true,
        parentId,
      },
      update: {
        name: m.name,
        path: m.path,
        icon: m.icon ?? null,
        sortOrder: m.sortOrder,
        parentId,
      },
    });
    codeToId.set(m.code, perm.id);
  }
  console.log(`✓ 种入 ${MENUS.length} 个菜单权限`);

  // 2. 超级管理员角色,拥有全部权限
  const role = await prisma.role.upsert({
    where: { code: "super_admin" },
    create: { code: "super_admin", name: "超级管理员", description: "拥有全部权限" },
    update: {},
  });
  const allPerms = await prisma.permission.findMany();
  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
  for (const p of allPerms) {
    await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: p.id } });
  }
  console.log(`✓ super_admin 关联 ${allPerms.length} 个权限`);

  // 3. 管理员账号 admin / admin123
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    create: {
      username: "admin",
      passwordHash: hashPassword("admin123"),
      realName: "超级管理员",
    },
    update: {},
  });
  await prisma.adminRole.upsert({
    where: { adminId_roleId: { adminId: admin.id, roleId: role.id } },
    create: { adminId: admin.id, roleId: role.id },
    update: {},
  });
  console.log("✓ 管理员账号: admin / admin123");

  // 4. 会员等级
  const levels = [
    { code: "bronze", name: "青铜", minPoints: 0, discount: 1.0, sortOrder: 1 },
    { code: "silver", name: "白银", minPoints: 500, discount: 0.98, sortOrder: 2 },
    { code: "gold", name: "黄金", minPoints: 2000, discount: 0.95, sortOrder: 3 },
    { code: "platinum", name: "铂金", minPoints: 5000, discount: 0.9, sortOrder: 4 },
  ];
  for (const lv of levels) {
    await prisma.userLevel.upsert({
      where: { code: lv.code },
      create: lv,
      update: {},
    });
  }
  console.log(`✓ 会员等级: ${levels.map((l) => l.name).join("/")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
