import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { requireUser } from "@/lib/auth/session";
import { AddressService } from "@/modules/member/service/address.service";
import { createAddressSchema } from "@/modules/member/domain/address";

/** 我的地址列表 */
export const GET = withErrorHandler(async () => {
  const user = await requireUser();
  const service = new AddressService();
  return ApiResponse.ok(await service.listMy(user.userId));
});

/** 新增地址 */
export const POST = withErrorHandler(async (req) => {
  const user = await requireUser();
  const input = createAddressSchema.parse(await req.json());
  const service = new AddressService();
  return ApiResponse.ok(await service.create(user.userId, input, user.userId));
});
