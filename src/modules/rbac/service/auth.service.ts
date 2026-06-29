import type { IAdminRepository } from "../repository";
import { createAdminRepository } from "../repository";
import { verifyPassword } from "@/lib/auth/password";
import { signAdminToken } from "@/lib/auth/jwt";
import { AuthError, ForbiddenError } from "@/lib/errors";

/** 后台管理员账号密码登录。 */
export class AdminAuthService {
  constructor(
    private readonly admins: IAdminRepository = createAdminRepository(),
  ) {}

  async login(
    username: string,
    password: string,
    ip?: string | null,
  ): Promise<string> {
    const admin = await this.admins.findByUsername(username);
    // 账号不存在与密码错误返回相同文案,避免账号枚举
    if (!admin || !admin.passwordHash) {
      throw new AuthError("账号或密码错误");
    }
    if (admin.status !== "active") {
      throw new ForbiddenError("管理员账号已被禁用");
    }
    if (!verifyPassword(password, admin.passwordHash)) {
      throw new AuthError("账号或密码错误");
    }
    await this.admins.updateLastLogin(admin.id, ip ?? null);
    return signAdminToken({
      type: "admin",
      adminId: admin.id,
      username: admin.username,
    });
  }
}
