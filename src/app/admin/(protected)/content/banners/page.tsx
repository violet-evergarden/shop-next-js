import { BannerService } from "@/modules/content/service/banner.service";
import { BannerForm } from "@/components/admin/banner-form";
import { DeleteBannerButton } from "@/components/admin/delete-banner-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminBannersPage() {
  const service = new BannerService();
  const { items } = await service.list({ page: 1, pageSize: 50 });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Banner 管理</h1>
      <BannerForm />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>排序</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.title}</TableCell>
                <TableCell>{b.sortOrder}</TableCell>
                <TableCell>{b.isActive ? "启用" : "停用"}</TableCell>
                <TableCell>
                  <DeleteBannerButton id={b.id} />
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  暂无 Banner
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
