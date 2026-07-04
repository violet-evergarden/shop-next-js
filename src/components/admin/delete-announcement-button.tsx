"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteAnnouncementButton({ id }: { id: string }) {
  const router = useRouter();
  async function remove() {
    if (!confirm("删除该公告?")) return;
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.refresh();
    } else {
      alert("删除失败");
    }
  }
  return (
    <Button size="sm" variant="ghost" onClick={remove}>
      删除
    </Button>
  );
}
