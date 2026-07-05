"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BannerForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    image: "",
    link: "",
    sortOrder: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof typeof form, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
    });
    setLoading(false);
    if (res.ok) {
      setForm({ title: "", image: "", link: "", sortOrder: 0 });
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.message ?? "保存失败");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border p-4">
      <h3 className="font-medium">新增 Banner</h3>
      <div className="space-y-1">
        <Label>标题</Label>
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label>图片 URL</Label>
        <Input value={form.image} onChange={(e) => set("image", e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label>链接(可选)</Label>
        <Input value={form.link} onChange={(e) => set("link", e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>排序</Label>
        <Input
          type="number"
          value={form.sortOrder}
          onChange={(e) => set("sortOrder", Number(e.target.value))}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "保存中…" : "保存"}
      </Button>
    </form>
  );
}
