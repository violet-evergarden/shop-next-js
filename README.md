# 企业级商城 (Shop)

基于 **Next.js 15 + Prisma 7 + DDD** 的企业级商城系统,支持 **PostgreSQL / MySQL / SQLite 三库自由切换**,前台 MetaMask 钱包登录,后台 RBAC + 动态菜单。

## 技术栈

- **Next.js 15** App Router(Server Components 优先)
- **TypeScript** Strict
- **Prisma 7** + driver adapters(三库切换)
- **TailwindCSS v4** + **shadcn/ui**
- **Zod** + React Hook Form
- **ethers**(MetaMask 签名验证) + **jose**(JWT)
- **vitest**(测试)

## 功能

### 前台(Storefront)
首页(Banner)、商品列表/搜索/分类、商品详情(SKU+加购)、MetaMask 钱包登录、购物车、下单(事务+防超卖)、我的订单、收货地址、收藏、优惠券(领取/我的券)

### 后台(Admin)
Dashboard、商品管理(CRUD)、订单管理(状态流转)、会员管理、内容(Banner/公告)、系统(管理员/角色/权限/操作日志)、**动态菜单**(由 Permission 表生成,不硬编码)

## 快速开始

### 1. 环境
Node.js ≥ 18.18(推荐 20+):
```bash
nvm use 20   # 或 nvm alias default 20
```

### 2. 安装
```bash
npm install
```

### 3. 配置数据库
```bash
cp .env.example .env
```
编辑 `.env`,选择数据库引擎(默认 SQLite,本地开发零依赖):
```bash
# SQLite(本地开发推荐,零依赖)
DATABASE_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"

# 或 PostgreSQL
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://user:pass@localhost:5432/shop?schema=public"

# 或 MySQL
DATABASE_PROVIDER=mysql
DATABASE_URL="mysql://user:pass@localhost:3306/shop"

# JWT 密钥(生产换强随机串)
JWT_SECRET="your-long-random-secret"
```

### 4. 建表 + 种子数据
```bash
npm run db:schema     # 按 DATABASE_PROVIDER 生成 schema.prisma
npm run db:push       # 建表(同步 schema 到数据库)
npm run db:generate   # 生成 Prisma Client

npx tsx scripts/seed-rbac.ts     # 管理员 + 角色 + 14 个菜单权限
npx tsx scripts/seed-catalog.ts  # 演示商品 + SKU + 库存
npx tsx scripts/seed-coupon.ts   # 优惠券
npx tsx scripts/seed-banner.ts   # 首页 Banner
```

### 5. 启动
```bash
npm run dev
```
- 前台: http://localhost:3000
- 后台: http://localhost:3000/admin/login(账号 **admin / admin123**)

## 三库切换

切换数据库**只改 `.env` 两行**,无需改代码:
```bash
DATABASE_PROVIDER=mysql        # postgresql | mysql | sqlite
DATABASE_URL="mysql://..."
```
然后:
```bash
npm run db:push   # 自动按新引擎重建 schema 并建表
```
> **原理**:`prisma/scripts/build-schema.ts` 按 `DATABASE_PROVIDER` 拼接对应 datasource 头 + 单份 model 定义;运行时 `src/lib/db.ts` 按引擎选 driver adapter(`PrismaPg` / `PrismaMariaDb` / `PrismaBetterSqlite3`)。

**Schema 三库兼容约定**:不用 enum(用 String + Zod)、不用 Json[]、不用 `@db.*` 注解、不用 PG 特有索引/触发器。

## 架构(DDD 分层)

```
src/
├── modules/              # 领域模块(高内聚)
│   ├── catalog/          # 商品:domain + repository(port) + service + Prisma 实现(adapter)
│   ├── trade/            # 交易:cart / order
│   ├── member/           # 会员:user / address / favorite
│   ├── rbac/             # 权限:admin / role / permission / operation-log
│   ├── marketing/        # 营销:coupon
│   └── content/          # 内容:banner / announcement
├── lib/                  # 基础设施
│   ├── db.ts             # Prisma client(driver adapter)
│   ├── auth/             # JWT + session(requireUser/requireAdmin)
│   ├── web3/             # MetaMask nonce + 签名验证
│   ├── http/             # withErrorHandler + withAdminAction(操作日志)
│   ├── errors/           # AppError 体系
│   └── response.ts       # 统一响应 {code,message,data}
├── app/
│   ├── (storefront)/     # 前台页面
│   ├── admin/            # 后台页面
│   └── api/              # Route Handler(storefront/ + admin/)
└── middleware.ts         # Edge 鉴权(/admin, /api/admin)
prisma/
├── datasources/          # 三库 datasource 头(只 provider,无 url)
├── models/               # 单份 model 定义,三库共用
└── scripts/build-schema.ts
```

**分层职责**:
- **domain**:Zod schema(领域契约)+ 纯函数规则(价格计算等),零依赖
- **repository**:接口(port)+ Prisma 实现(adapter),`ctx.tx` 透传事务
- **service**:用例编排,只依赖 repository 接口(可 mock 测试)
- **API**:Route Handler + `withErrorHandler`/`withAdminAction`

## 常用脚本

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run test` | vitest 测试 |
| `npm run db:schema` | 按 provider 生成 schema.prisma |
| `npm run db:push` | 同步 schema 到数据库 |
| `npm run db:generate` | 生成 Prisma Client |
| `npm run db:studio` | Prisma Studio(可视化数据) |

## 验证脚本(scripts/)

`verify-*.ts` 用于端到端验证各链路(可作示例):
- `verify-web3-auth.ts` MetaMask 登录(ethers 模拟签名)
- `verify-admin-auth.ts` 后台登录 + 动态菜单
- `verify-checkout.ts` 下单(事务/防超卖/回滚)
- `verify-cart.ts` 购物车 + 越权防护
- `verify-adapter.ts` driver adapter 连接
- `mint-token.ts` 签发测试用户 token(curl 验证登录态 API 用)

## 默认账号

- **后台**:`admin` / `admin123`(seed 种入,**生产必改**)
- **前台**:MetaMask 钱包登录(首次自动建用户)
