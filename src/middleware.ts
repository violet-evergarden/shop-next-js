import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_COOKIE } from "@/lib/auth/jwt";

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET);

/** 校验后台管理员 token(Edge runtime,只用 jose,不碰 Prisma) */
async function isAdminAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 保护后台 API(登录接口除外)
  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/auth")
  ) {
    if (!(await isAdminAuthed(req))) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "请先登录后台", data: null },
        { status: 401 },
      );
    }
  }

  // 保护后台页面(登录页除外)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!(await isAdminAuthed(req))) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*", "/admin/:path*"],
};
