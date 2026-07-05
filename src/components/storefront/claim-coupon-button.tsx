"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** 领取优惠券按钮 */
export function ClaimCouponButton({ couponId }: { couponId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function claim() {
    setLoading(true);
    const res = await fetch("/api/storefront/coupons/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ couponId }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else if (res.status === 401) {
      alert("请先钱包登录");
    } else if (res.status === 409) {
      alert("已领取过该券");
    } else {
      alert("领取失败");
    }
  }

  return (
    <Button size="sm" onClick={claim} disabled={loading}>
      {loading ? "领取中…" : "领取"}
    </Button>
  );
}
