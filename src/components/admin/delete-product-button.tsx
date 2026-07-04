"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** 商品删除按钮(软删除,带确认) */
export function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm(`确认删除商品「${name}」?\n(软删除,数据库记录保留)`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      alert("删除失败");
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onDelete}
      disabled={loading}
    >
      {loading ? "删除中…" : "删除"}
    </Button>
  );
}
