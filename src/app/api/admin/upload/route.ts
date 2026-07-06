import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import { randomBytes } from "node:crypto";
import { requireAdmin } from "@/lib/auth/session";

/** 商品图片上传(本地 public/uploads) */
export async function POST(req: NextRequest) {
  await requireAdmin();
  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "缺少 file", data: null }, { status: 422 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ code: "FILE_TOO_LARGE", message: "文件超过 5MB", data: null }, { status: 422 });
  }
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const ext = extname(file.name).toLowerCase();
  if (!allowed.includes(ext)) {
    return NextResponse.json({ code: "INVALID_TYPE", message: "仅支持 jpg/png/webp/gif", data: null }, { status: 422 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  const dir = join(process.cwd(), "public", "uploads");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), buf);
  return NextResponse.json({ code: 0, message: "ok", data: { url: `/uploads/${name}` } });
}
