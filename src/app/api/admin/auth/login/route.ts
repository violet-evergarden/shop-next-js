import { z } from "zod";
import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { AdminAuthService } from "@/modules/rbac/service/auth.service";
import { ADMIN_COOKIE, ADMIN_COOKIE_OPTIONS } from "@/lib/auth/session";

const bodySchema = z.object({
  username: z.string(),
  password: z.string(),
});

/** 后台管理员登录,通过则下发 admin token cookie */
export const POST = withErrorHandler(async (req) => {
  const { username, password } = bodySchema.parse(await req.json());
  const ip = req.headers.get("x-forwarded-for") ?? null;
  const service = new AdminAuthService();
  const token = await service.login(username, password, ip);
  const res = ApiResponse.ok({ token });
  res.cookies.set(ADMIN_COOKIE, token, ADMIN_COOKIE_OPTIONS);
  return res;
});
