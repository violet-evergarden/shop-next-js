import { SignJWT, jwtVerify } from "jose";

/**
 * JWT 签发/验证(用 jose,兼容 Next.js Edge runtime / middleware)。
 * 前台用户与后台管理员用不同 cookie + 不同 payload type。
 */

const ENCODER = new TextEncoder();

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("环境变量 JWT_SECRET 未配置");
  return ENCODER.encode(secret);
}

export interface UserSessionPayload {
  type: "user";
  userId: string;
  walletAddress: string;
}

export interface AdminSessionPayload {
  type: "admin";
  adminId: string;
  username: string;
}

export const USER_COOKIE = "shop_user_token";
export const ADMIN_COOKIE = "shop_admin_token";

export async function signUserToken(
  payload: UserSessionPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .setSubject(payload.userId)
    .sign(getSecret());
}

export async function signAdminToken(
  payload: AdminSessionPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .setSubject(payload.adminId)
    .sign(getSecret());
}

export async function verifyToken<T = unknown>(token: string): Promise<T> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as T;
}
