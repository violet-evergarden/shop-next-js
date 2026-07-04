import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { NotFoundError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/session";
import { AddressService } from "@/modules/member/service/address.service";

/** 删除地址(校验归属) */
export const DELETE = withErrorHandler(async (_req, ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const idStr = Array.isArray(id) ? id[0] : id;
  if (!idStr) throw new NotFoundError("地址不存在");
  const service = new AddressService();
  await service.remove(user.userId, idStr, user.userId);
  return ApiResponse.ok({ id: idStr });
});
