"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELD_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function AddressForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    receiver: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    detail: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/storefront/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setForm({ receiver: "", phone: "", province: "", city: "", district: "", detail: "" });
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.message ?? "保存失败");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border p-4">
      <h3 className="font-medium">新增地址</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>收货人</Label>
          <Input value={form.receiver} onChange={(e) => set("receiver", e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>电话</Label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input placeholder="省" value={form.province} onChange={(e) => set("province", e.target.value)} required className={FIELD_CLASS} />
        <Input placeholder="市" value={form.city} onChange={(e) => set("city", e.target.value)} required />
        <Input placeholder="区" value={form.district} onChange={(e) => set("district", e.target.value)} required />
      </div>
      <Input placeholder="详细地址" value={form.detail} onChange={(e) => set("detail", e.target.value)} required />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "保存中…" : "保存"}
      </Button>
    </form>
  );
}
