import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export default async function AdminAdminsPage() {
  await requireAdmin();
  const admins = await prisma.admin.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: { roles: { include: { role: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">管理员</h1>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>账号</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>最后登录</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.username}</TableCell>
                <TableCell>{a.realName ?? "-"}</TableCell>
                <TableCell>
                  {a.roles.map((r) => r.role.name).join(", ") || "-"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {a.lastLoginAt
                    ? a.lastLoginAt.toISOString().slice(0, 16).replace("T", " ")
                    : "从未"}
                </TableCell>
                <TableCell>{a.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
