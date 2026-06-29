import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductService } from "@/modules/catalog/service/product.service";

export default async function DashboardPage() {
  const productService = new ProductService();
  const { total: productTotal } = await productService.listAll({
    page: 1,
    pageSize: 1,
  });

  const stats = [
    { label: "商品总数", value: productTotal },
    { label: "待付款订单", value: "-" },
    { label: "今日销售额", value: "-" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
