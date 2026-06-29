import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { ApiResponse } from "@/lib/response";

/** Route Handler 的上下文(Next 15 params 是 Promise) */
export type RouteContext = {
  params: Promise<Record<string, string | string[]>>;
};

export type RouteHandler = (
  req: NextRequest,
  ctx: RouteContext,
) => Promise<Response> | Response;

/**
 * Route Handler 统一错误处理包装 —— 兑现"错误统一处理中间件"。
 * AppError → 按 statusCode + code 转响应;未知异常 → 500。
 * 用法: export const POST = withErrorHandler(async (req) => { ... });
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof AppError) {
        return ApiResponse.error(e.code, e.message, e.statusCode);
      }
      if (e instanceof ZodError) {
        const msg = e.errors
          .map((x) => `${x.path.join(".")}: ${x.message}`)
          .join("; ");
        return ApiResponse.error("VALIDATION_ERROR", msg || "参数校验失败", 422);
      }
      console.error("[withErrorHandler] 未处理异常:", e);
      return ApiResponse.error("INTERNAL_ERROR", "服务器内部错误", 500);
    }
  };
}
