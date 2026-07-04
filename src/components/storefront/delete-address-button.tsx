"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteAddressButton({ id }: { id: string }) {
  const router = useRouter();
  async function remove() {
    if (!confirm("删除该地址?")) return;
    await fetch(`/api/storefront/addresses/${id}`, { method: "DELETE" });
    router.refresh();
  }
  return (
    <Button size="sm" variant="ghost" onClick={remove}>
      删除
    </Button>
  );
}
