import { z } from "zod";
import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { Web3AuthService } from "@/modules/member/service/auth.service";

const bodySchema = z.object({ walletAddress: z.string().min(1) });

/** 取签名 nonce + 待签名消息 */
export const POST = withErrorHandler(async (req) => {
  const { walletAddress } = bodySchema.parse(await req.json());
  const service = new Web3AuthService();
  const result = await service.getNonce(walletAddress);
  return ApiResponse.ok(result);
});
