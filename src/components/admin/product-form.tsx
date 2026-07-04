"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELD_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export interface ProductFormInitial {
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  status: string;
}

export function ProductForm({
  mode,
  productId,
  initial,
  categories,
}: {
  mode: "create" | "edit";
  productId?: string;
  initial?: Partial<ProductFormInitial>;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormInitial>({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    subtitle: initial?.subtitle ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    originalPrice: initial?.originalPrice,
    categoryId: initial?.categoryId ?? "",
    status: initial?.status ?? "draft",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof ProductFormInitial>(
    key: K,
    value: ProductFormInitial[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const body = {
      ...form,
      price: Number(form.price),
      originalPrice:
        form.originalPrice === undefined ? undefined : Number(form.originalPrice),
      categoryId: form.categoryId || undefined,
    };
    const url =
      mode === "create"
        ? "/api/admin/products"
        : `/api/admin/products/${productId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/catalog/products");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "保存失败");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <div className="space-y-2">
        <Label>商品名</Label>
        <Input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Slug(URL 标识)</Label>
        <Input
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>副标题</Label>
        <Input
          value={form.subtitle}
          onChange={(e) => set("subtitle", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>价格</Label>
          <Input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => set("price", Number(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>划线价(可选)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.originalPrice ?? ""}
            onChange={(e) =>
              set(
                "originalPrice",
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>分类</Label>
          <select
            className={FIELD_CLASS}
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
          >
            <option value="">未分类</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>状态</Label>
          <select
            className={FIELD_CLASS}
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="draft">草稿</option>
            <option value="active">上架</option>
            <option value="archived">归档</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>描述</Label>
        <textarea
          className={`${FIELD_CLASS} min-h-[80px]`}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "保存中…" : "保存"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          取消
        </Button>
      </div>
    </form>
  );
}
