import { randomBytes } from "node:crypto";

/** 生成一次性签名 nonce(32 hex 字符) */
export function generateNonce(): string {
  return randomBytes(16).toString("hex");
}
