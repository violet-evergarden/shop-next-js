/**
 * 按 DATABASE_PROVIDER 拼接生成 prisma/schema.prisma
 *
 * 工作流:
 *   prisma/datasources/<provider>.prisma   (generator + datasource 头)
 * + prisma/models/*.prisma                 (单份 model 定义,三库共用)
 * = prisma/schema.prisma                   (产物,已 gitignore)
 *
 * 用法:  npm run db:schema
 * 环境:  DATABASE_PROVIDER = postgresql | mysql | sqlite (默认 postgresql)
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRISMA_DIR = resolve(__dirname, "..");

const VALID_PROVIDERS = ["postgresql", "mysql", "sqlite"] as const;
type Provider = (typeof VALID_PROVIDERS)[number];

function getProvider(): Provider {
  const raw = process.env.DATABASE_PROVIDER;
  if (!raw) {
    console.warn("⚠️  未设置 DATABASE_PROVIDER,默认使用 postgresql");
    return "postgresql";
  }
  if (!VALID_PROVIDERS.includes(raw as Provider)) {
    throw new Error(
      `不支持的 DATABASE_PROVIDER="${raw}",可选: ${VALID_PROVIDERS.join(", ")}`,
    );
  }
  return raw as Provider;
}

/**
 * 加载项目根 .env(仅填充尚未存在的环境变量,真实 shell 环境变量优先)。
 * npm run 默认不加载 .env,而本脚本要靠 DATABASE_PROVIDER 决定拼接哪个 datasource,
 * 所以这里自行解析,避免与 Prisma CLI 读到的 DATABASE_URL 错配。
 */
function loadEnvFile(): void {
  const envPath = resolve(PRISMA_DIR, "..", ".env");
  try {
    const content = readFileSync(envPath, "utf8");
    for (const raw of content.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // 无 .env 文件时忽略,使用默认 provider
  }
}

function build(): void {
  loadEnvFile();
  const provider = getProvider();

  const header = readFileSync(
    resolve(PRISMA_DIR, "datasources", `${provider}.prisma`),
    "utf8",
  );

  const modelDir = resolve(PRISMA_DIR, "models");
  const modelFiles = readdirSync(modelDir)
    .filter((f) => f.endsWith(".prisma"))
    .sort();
  const models = modelFiles.map((f) =>
    readFileSync(resolve(modelDir, f), "utf8"),
  );

  const banner = [
    "// =================================================================",
    "// ⚠️ 自动生成,请勿手动编辑。",
    "// 修改请编辑 prisma/datasources/* 与 prisma/models/*,",
    "// 然后运行: npm run db:schema",
    `// 当前 provider: ${provider}`,
    "// =================================================================",
  ].join("\n");

  const output = [banner, header, ...models].join("\n\n");
  writeFileSync(resolve(PRISMA_DIR, "schema.prisma"), output);

  console.log(
    `✓ 已生成 schema.prisma (provider=${provider}, 合并 ${modelFiles.length} 个模型文件)`,
  );
}

build();
