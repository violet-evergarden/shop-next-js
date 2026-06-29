import { cookies } from "next/headers";
import {
  verifyToken,
  USER_COOKIE,
  ADMIN_COOKIE,
  type UserSessionPayload,
  type AdminSessionPayload,
} from "./jwt";
import { AuthError } from "@/lib/errors";

// 对外暴露 cookie 名常量(API route 集中取名字 + options)
export { USER_COOKIE, ADMIN_COOKIE };

/** cookie 写入选项(httpOnly 防 JS 读取;生产启用 secure) */
const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const USER_COOKIE_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 7 * 24 * 60 * 60, // 7 天,与 token 过期一致
};

export const ADMIN_COOKIE_OPTIONS = {
  ...baseCookieOptions,
  maxAge: 12 * 60 * 60, // 12 小时
};

/** 当前登录的前台用户(未登录或 token 失效返回 null) */
export async function getCurrentUser(): Promise<UserSessionPayload | null> {
  const store = await cookies();
  const token = store.get(USER_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = await verifyToken<UserSessionPayload>(token);
    return payload.type === "user" ? payload : null;
  } catch {
    return null;
  }
}

/** 要求前台用户登录,否则抛 401 */
export async function requireUser(): Promise<UserSessionPayload> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("请先登录");
  return user;
}

/** 当前后台管理员(未登录或 token 失效返回 null) */
export async function getCurrentAdmin(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = await verifyToken<AdminSessionPayload>(token);
    return payload.type === "admin" ? payload : null;
  } catch {
    return null;
  }
}

/** 要求后台管理员登录,否则抛 401 */
export async function requireAdmin(): Promise<AdminSessionPayload> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new AuthError("请先登录后台");
  return admin;
}
