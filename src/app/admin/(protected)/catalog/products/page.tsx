import Link from "next/link";
import { ProductService } from "@/modules/catalog/service/product.service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-muted text-muted-foreground",
  archived: "bg-amber-100 text-amber-700",
};

export default async function AdminProductsPage() {
  const service = new ProductService();
  const { items, total } = await service.listAll({ page: 1, pageSize: 50 });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          商品管理
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            共 {total} 件
          </span>
        </h1>
        <Link href="/admin/catalog/products/new">
          <Button>新增商品</Button>
        </Link>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>商品名</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>价格</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>销量</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {p.slug}
                </TableCell>
                <TableCell>¥{p.price.toString()}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-block rounded px-2 py-0.5 text-xs",
                      STATUS_STYLE[p.status] ??
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {p.status}
                  </span>
                </TableCell>
                <TableCell>{p.sales}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/admin/catalog/products/${p.id}/edit`}>
                      <Button size="sm" variant="outline">
                        编辑
                      </Button>
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  暂无商品
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
