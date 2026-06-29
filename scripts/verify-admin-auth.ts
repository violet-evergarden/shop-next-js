/**
 * 后台鉴权 + 动态菜单验证。
 * 跑通 admin 登录 → 错误密码被拒 → 菜单树动态生成 → 权限聚合。
 * 前置:先执行 npx tsx scripts/seed-rbac.ts。
 */
import { AdminAuthService } from "../src/modules/rbac/service/auth.service";
import { PermissionService } from "../src/modules/rbac/service/permission.service";
import { verifyToken } from "../src/lib/auth/jwt";

async function main() {
  const authService = new AdminAuthService();
  const permService = new PermissionService();

  // 1. 正确登录
  const token = await authService.login("admin", "admin123", "127.0.0.1");
  console.log("✓ admin 登录成功,签发 token");
  const payload = await verifyToken<{
    type: string;
    adminId: string;
    username: string;
  }>(token);
  console.log("✓ token:", JSON.stringify({ type: payload.type, username: payload.username }));

  // 2. 错误密码被拒
  try {
    await authService.login("admin", "wrong-password");
    console.log("✗ 错误密码未被拒绝(逻辑有误)");
  } catch (e) {
    console.log("✓ 错误密码被拒:", (e as Error).message);
  }

  // 3. 动态菜单树(来自 Permission 表,非硬编码)
  const menuTree = await permService.getAdminMenuTree(payload.adminId);
  console.log("✓ 菜单树顶层节点数:", menuTree.length);
  for (const node of menuTree) {
    const kids = node.children.map((c) => c.name).join(", ") || "无";
    console.log(`   ${node.sortOrder}. ${node.name}  ${node.path}  [${kids}]`);
  }

  // 4. 权限码总数
  const perms = await permService.getAdminPermissions(payload.adminId);
  console.log("✓ admin 拥有权限数:", perms.length);
}

main().catch((e) => {
  console.error("✗ 失败:", e);
  process.exit(1);
});
