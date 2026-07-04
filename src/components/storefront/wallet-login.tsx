"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    } | undefined;
  }
}

/** MetaMask 钱包登录(nonce → personal_sign → verify) */
export function WalletLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login() {
    if (!window.ethereum) {
      setError("未检测到 MetaMask,请先安装钱包扩展");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      const address = accounts[0];
      if (!address) throw new Error("未获取到账户");

      const nonceRes = await fetch("/api/storefront/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });
      const { data } = await nonceRes.json();
      const message: string = data.message;

      const signature = (await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      })) as string;

      const verifyRes = await fetch("/api/storefront/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, signature }),
      });
      if (verifyRes.ok) {
        router.refresh();
      } else {
        const err = await verifyRes.json().catch(() => ({}));
        setError(err.message ?? "登录失败");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-end">
      <Button size="sm" onClick={login} disabled={loading}>
        {loading ? "登录中…" : "钱包登录"}
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
