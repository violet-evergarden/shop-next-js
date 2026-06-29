/**
 * 应用错误基类体系。
 * Service 抛这些错误,Step 6 的 withErrorHandler 统一捕获并转成 API 响应。
 * 不用裸 Error,以便携带业务 code + HTTP statusCode。
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** 401 未认证 / 登录失败 */
export class AuthError extends AppError {
  constructor(message: string, code = "UNAUTHORIZED", statusCode = 401) {
    super(code, message, statusCode);
    this.name = "AuthError";
  }
}

/** 403 无权限 / 账号禁用 */
export class ForbiddenError extends AppError {
  constructor(message: string, code = "FORBIDDEN") {
    super(code, message, 403);
    this.name = "ForbiddenError";
  }
}

/** 404 资源不存在 */
export class NotFoundError extends AppError {
  constructor(message: string, code = "NOT_FOUND") {
    super(code, message, 404);
    this.name = "NotFoundError";
  }
}

/** 422 参数校验失败 */
export class ValidationError extends AppError {
  constructor(message: string, code = "VALIDATION_ERROR") {
    super(code, message, 422);
    this.name = "ValidationError";
  }
}

/** 409 状态冲突(库存不足、重复操作等) */
export class ConflictError extends AppError {
  constructor(message: string, code = "CONFLICT") {
    super(code, message, 409);
    this.name = "ConflictError";
  }
}
