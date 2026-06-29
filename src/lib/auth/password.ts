import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * 密码哈希:Node 内置 scrypt(无需原生编译依赖,跨平台稳定)。
 * 存储格式:salt(16B hex):hash(64B hex)
 * 企业级若要更强可换 argon2id,但需原生依赖;scrypt 对本规模足够。
 */
const KEY_LEN = 64;
const SALT_LEN = 16;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  if (!salt || !hash) return false; // 收窄 noUncheckedIndexedAccess 的 string|undefined
  const computed = scryptSync(password, salt, KEY_LEN);
  const expected = Buffer.from(hash, "hex");
  // 长度不一致时 timingSafeEqual 会抛错,先比较长度
  return (
    computed.length === expected.length && timingSafeEqual(computed, expected)
  );
}
