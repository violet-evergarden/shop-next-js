/** 用户状态 */
export const USER_STATUS = {
  ACTIVE: "active",
  DISABLED: "disabled",
} as const;
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

/**
 * MetaMask 登录签名消息模板。
 * 前端对这段消息用钱包签名,服务端用相同模板恢复地址做比对。
 */
export function buildNonceMessage(nonce: string): string {
  return [
    "欢迎使用商城,签名即登录。",
    "本请求不会发起任何链上交易,也不会消耗 Gas。",
    "",
    `Nonce: ${nonce}`,
  ].join("\n");
}
