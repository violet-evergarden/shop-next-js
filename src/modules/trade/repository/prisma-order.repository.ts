import type { PrismaClient, Order } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import { prisma } from "@/lib/db";
import { toSkip, toPaginated, type Paginated } from "@/lib/types";
import type {
  CreateOrderData,
  IOrderRepository,
  OrderQueryInput,
  OrderWithItems,
} from "./order.repository";

/** 生成对外订单号(普通 Node 运行时,可用 Date/random) */
function generateOrderNo(): string {
  const ts = Date.now().toString().slice(-10);
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD${ts}${rand}`;
}

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  private db(ctx?: RepoContext) {
    return ctx?.tx ?? this.client;
  }

  async createWithItems(
    data: CreateOrderData,
    ctx?: RepoContext,
  ): Promise<OrderWithItems> {
    return this.db(ctx).order.create({
      data: {
        orderNo: generateOrderNo(),
        userId: data.userId,
        status: data.status,
        totalAmount: data.totalAmount,
        discountAmount: data.discountAmount,
        shippingFee: data.shippingFee,
        payAmount: data.payAmount,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        receiverAddress: data.receiverAddress,
        couponId: data.couponId,
        remark: data.remark,
        createdBy: ctx?.actorId,
        items: {
          create: data.items.map((i) => ({
            productId: i.productId,
            skuId: i.skuId,
            productName: i.productName,
            productImage: i.productImage,
            skuName: i.skuName,
            price: i.price,
            quantity: i.quantity,
            totalAmount: i.totalAmount,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findById(id: string, ctx?: RepoContext): Promise<OrderWithItems | null> {
    return this.db(ctx).order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async findByOrderNo(
    orderNo: string,
    ctx?: RepoContext,
  ): Promise<OrderWithItems | null> {
    return this.db(ctx).order.findUnique({
      where: { orderNo },
      include: { items: true },
    });
  }

  async findManyByUser(
    userId: string,
    query: OrderQueryInput,
    ctx?: RepoContext,
  ): Promise<Paginated<Order>> {
    const where = {
      userId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.db(ctx).order.findMany({
        where,
        skip: toSkip(query),
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.db(ctx).order.count({ where }),
    ]);
    return toPaginated(items, total, query);
  }
}
