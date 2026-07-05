import { z } from "zod";
import { withAdminAction } from "@/lib/http/with-audit";
import { ApiResponse } from "@/lib/response";
import { NotFoundError } from "@/lib/errors";
import { type RouteContext } from "@/lib/http/with-handler";
import { requireAdmin } from "@/lib/auth/session";
import { OrderService } from "@/modules/trade/service/order.service";
import { ORDER_STATUS } from "@/modules/trade/domain/order";

const statusSchema = z.enum([
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PAID,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.REFUNDED,
  ORDER_STATUS.CANCELLED,
]);

/** 更新订单状态(自动记操作日志) */
export const PATCH = withAdminAction(
  "orders",
  "更新订单状态",
  async (req, ctx: RouteContext) => {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    if (!idStr) throw new NotFoundError("订单不存在");
    const { status } = z
      .object({ status: statusSchema })
      .parse(await req.json());
    const service = new OrderService();
    await service.updateStatus(idStr, status, admin.adminId);
    return ApiResponse.ok({ id: idStr, status });
  },
);
