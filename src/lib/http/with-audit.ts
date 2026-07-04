import type { NextRequest } from "next/server";
import { withErrorHandler, type RouteHandler } from "./with-handler";
import { getCurrentAdmin } from "@/lib/auth/session";
import { OperationLogService } from "@/modules/rbac/service/operation-log.service";

const logService = new OperationLogService();

/**
 * 包装后台写操作 Route Handler,自动记录操作日志。
 * - 成功/失败都记(status + errorMessage + 耗时)
 * - params 取请求体(截断 2000 字符,避免大 body)
 * - 日志写入失败不影响主流程(record 内部已 catch)
 *
 * 用法:
 *   export const POST = withAdminAction("catalog", "新增商品", async (req) => {...})
 *
 * 读操作(GET)用 withErrorHandler 即可,无需日志。
 */
export function withAdminAction(
  module: string,
  action: string,
  handler: RouteHandler,
): RouteHandler {
  return withErrorHandler(async (req: NextRequest, ctx) => {
    const start = Date.now();
    const cloned = req.clone(); // 克隆读 body(原 req 给 handler)
    let status = 1;
    let errorMessage: string | null = null;
    try {
      return await handler(req, ctx);
    } catch (e) {
      status = 0;
      errorMessage = e instanceof Error ? e.message : String(e);
      throw e; // 交给外层 withErrorHandler 转响应
    } finally {
      const duration = Date.now() - start;
      const admin = await getCurrentAdmin().catch(() => null);
      let params: string | null = null;
      try {
        const text = await cloned.text();
        params = text ? text.slice(0, 2000) : null;
      } catch {
        // 无 body 或已读,忽略
      }
      await logService.record({
        adminId: admin?.adminId ?? null,
        module,
        action,
        method: req.method,
        path: req.nextUrl.pathname,
        params,
        ip: req.headers.get("x-forwarded-for"),
        userAgent: req.headers.get("user-agent"),
        status,
        duration,
        errorMessage,
      });
    }
  });
}
