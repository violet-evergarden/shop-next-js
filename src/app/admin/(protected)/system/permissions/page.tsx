import { prisma } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminPermissionsPage() {
  const permissions = await prisma.permission.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">权限 / 菜单</h1>
      <p className="text-sm text-muted-foreground">
        菜单由本表动态生成,如需新增菜单请直接插入 Permission(type=menu) 记录。
      </p>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>编码</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>路径</TableHead>
              <TableHead>排序</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="font-mono text-xs">{p.code}</TableCell>
                <TableCell>{p.type}</TableCell>
                <TableCell className="text-muted-foreground">
                  {p.path ?? "-"}
                </TableCell>
                <TableCell>{p.sortOrder}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
