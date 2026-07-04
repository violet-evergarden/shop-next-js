import { AnnouncementService } from "@/modules/content/service/announcement.service";
import { DeleteAnnouncementButton } from "@/components/admin/delete-announcement-button";
import { AddAnnouncementForm } from "@/components/admin/add-announcement-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminAnnouncementsPage() {
  const service = new AnnouncementService();
  const { items } = await service.list({ page: 1, pageSize: 50 });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">公告管理</h1>
      <AddAnnouncementForm />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>内容</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.title}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {a.content}
                </TableCell>
                <TableCell>{a.isActive ? "启用" : "停用"}</TableCell>
                <TableCell>
                  <DeleteAnnouncementButton id={a.id} />
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  暂无公告
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
