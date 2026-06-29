import { NextResponse } from "next/server";

/** 统一成功响应体 */
export interface ApiSuccess<T> {
  code: number;
  message: string;
  data: T;
}

/** 统一失败响应体 */
export interface ApiError {
  code: string;
  message: string;
  data: null;
}

/**
 * 统一 API 响应封装。
 * 成功:HTTP status + { code:0, message, data }
 * 失败:HTTP status(来自 AppError) + { code:业务码, message, data:null }
 */
export const ApiResponse = {
  ok<T>(data: T, message = "ok", status = 200) {
    return NextResponse.json(
      { code: 0, message, data } satisfies ApiSuccess<T>,
      { status },
    );
  },
  error(code: string, message: string, status: number) {
    return NextResponse.json(
      { code, message, data: null } satisfies ApiError,
      { status },
    );
  },
} as const;
