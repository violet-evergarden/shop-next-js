"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/** 收藏按钮(toggle,未登录提示) */
export function FavoriteButton({
  productId,
  initial = false,
}: {
  productId: string;
  initial?: boolean;
}) {
  const [favorited, setFavorited] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/storefront/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setLoading(false);
    if (res.ok) {
      const { data } = await res.json();
      setFavorited(data.favorited);
    } else if (res.status === 401) {
      alert("请先在右上角完成钱包登录");
    }
  }

  return (
    <Button variant="outline" onClick={toggle} disabled={loading}>
      {favorited ? "♥ 已收藏" : "♡ 收藏"}
    </Button>
  );
}
