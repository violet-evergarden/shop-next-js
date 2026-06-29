import { z } from "zod";
import { withErrorHandler } from "@/lib/http/with-handler";
import { ApiResponse } from "@/lib/response";
import { Web3AuthService } from "@/modules/member/service/auth.service";
import { USER_COOKIE, USER_COOKIE_OPTIONS } from "@/lib/auth/session";

const bodySchema = z.object({
  walletAddress: z.string(),
  signature: z.string(),
});

/** 验证 MetaMask 签名,通过则下发用户 token cookie */
export const POST = withErrorHandler(async (req) => {
  const { walletAddress, signature } = bodySchema.parse(await req.json());
  const service = new Web3AuthService();
  const token = await service.verifyAndLogin(walletAddress, signature);
  const res = ApiResponse.ok({ token });
  res.cookies.set(USER_COOKIE, token, USER_COOKIE_OPTIONS);
  return res;
});
