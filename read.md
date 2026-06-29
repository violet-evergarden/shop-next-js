你是一位拥有10年以上经验的全栈架构师。

帮助我开发一个企业级商城系统。

技术栈：

- Next.js 15 App Router
- TypeScript
- Prisma ORM
- PostgreSQL
- MySQL
- SQLite
- 启动项目根据配置来确认数据库
- TailwindCSS
- shadcn/ui
- Zod
- React Hook Form
- 前端会员注册用metamust 等web3钱包验证

要求：

整个项目必须遵循DDD思想，但是不要过度设计。

目录结构必须清晰。

必须做到：

- 高内聚低耦合
- 可维护
- 可测试
- 可扩展
- 数据库可以自由切换 PostgreSQL MySQL SQLite
- Prisma Schema 不依赖数据库特性
- 所有SQL兼容三种数据库

代码规范：

- ESLint
- Prettier
- TypeScript Strict
- Server Components 优先
- Client Component 最小化
- 所有接口必须使用 Route Handler
- API 返回统一格式
- 错误统一处理中间件

不要一次生成所有代码。

请按照下面顺序一步一步完成：

1. 项目目录设计
2. Prisma Schema
3. Database Layer
4. Repository Layer
5. Service Layer
6. API Layer
7. Admin
8. Store Front
9. Dashboard
10. 测试

每一步结束等待我确认。


商城必须支持：

前台

- 首页
- 商品列表
- 商品详情
- 分类
- 搜索
- 购物车
- 收藏
- 下单
- 地址管理
- 用户中心
- 我的订单
- 我的优惠券

后台

Dashboard

商品

- 商品
- SKU
- 库存
- 图片
- 分类
- 品牌
- 标签

订单

- 待付款
- 已付款
- 已发货
- 已完成
- 已退款



会员

- 用户
- 等级
- 积分

内容

- Banner
- 首页配置
- 公告

系统

- 管理员
- 角色
- 权限(RBAC)
- 系统配置
- 操作日志

所有菜单都必须自动生成。

权限必须支持RBAC。

不要硬编码菜单。


请设计Prisma Schema。

要求：

数据库兼容：

- PostgreSQL
- MySQL
- SQLite

不要使用：

- Json[]
- Unsupported
- PostgreSQL Enum
- PostgreSQL Array
- PostgreSQL UUID
- PostgreSQL 特有 Index
- PostgreSQL Trigger

所有主键：

String @id @default(cuid())

时间：

createdAt
updatedAt

软删除：

deletedAt

所有表必须：

createdBy
updatedBy

必须建立：

User

Role

Permission

Category

Product

ProductImage

ProductSku

Inventory

Cart

CartItem

Order

OrderItem

Address

Coupon

Favorite

Banner

Config

OperationLog

Admin

设计ER图关系。

解释每张表作用。

最后生成完整schema.prisma。