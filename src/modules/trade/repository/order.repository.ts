import type { Order, Prisma } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import type { Paginated } from "@/lib/types";

/** 订单(含订单项),用于详情/创建返回 */
export type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true };
}>;

export interface CreateOrderItemData {
  productId: string;
  skuId: string | null;
  productName: string;
  productImage: string | null;
  skuName: string | null;
  price: number;
  quantity: number;
  totalAmount: number;
}

export interface CreateOrderData {
  userId: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  payAmount: number;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  couponId: string | null;
  remark: string | null;
  items: CreateOrderItemData[];
}

export interface OrderQueryInput {
  page: number;
  pageSize: number;
  status?: string;
}

export interface IOrderRepository {
  createWithItems(
    data: CreateOrderData,
    ctx?: RepoContext,
  ): Promise<OrderWithItems>;
  findById(id: string, ctx?: RepoContext): Promise<OrderWithItems | null>;
  findByOrderNo(
    orderNo: string,
    ctx?: RepoContext,
  ): Promise<OrderWithItems | null>;
  findManyByUser(
    userId: string,
    query: OrderQueryInput,
    ctx?: RepoContext,
  ): Promise<Paginated<Order>>;
}
