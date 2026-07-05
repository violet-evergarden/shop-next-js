"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBox({ initialKeyword }: { initialKeyword: string }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/products${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ""}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        placeholder="搜索商品…"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="max-w-xs"
      />
      <Button type="submit" variant="outline">
        搜索
      </Button>
    </form>
  );
}
