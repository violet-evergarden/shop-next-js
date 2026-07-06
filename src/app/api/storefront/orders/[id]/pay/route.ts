import { withErrorHandler, type RouteContext } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

/**
 * 模拟支付:订单 pending_payment → paid。
 * 真实支付集成时,这里替换为支付网关回调。
 */
export const POST = withErrorHandler(async (_req, ctx: RouteContext) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const orderId = Array.isArray(id) ? id[0] : id;
  if (!orderId) throw new NotFoundError("订单不存在");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== user.userId) {
    throw new NotFoundError("订单不存在");
  }
  if (order.status !== "pending_payment") {
    throw new ConflictError("订单状态不允许支付");
  }

  // 模拟支付成功:更新状态 + 记录支付时间
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "paid",
      paidAt: new Date(),
      payMethod: "mock",
    },
  });

  return ApiResponse.ok({ orderId, status: "paid" });
});
