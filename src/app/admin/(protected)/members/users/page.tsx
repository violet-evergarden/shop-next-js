import { UserService } from "@/modules/member/service/user.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminUsersPage() {
  const service = new UserService();
  const { items, total } = await service.listAll({ page: 1, pageSize: 50 });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        会员管理
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          共 {total} 人
        </span>
      </h1>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>钱包地址</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>积分</TableHead>
              <TableHead>等级</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono text-xs">
                  {u.walletAddress.slice(0, 10)}…
                </TableCell>
                <TableCell>{u.username ?? "-"}</TableCell>
                <TableCell>{u.points}</TableCell>
                <TableCell>{u.level?.name ?? "-"}</TableCell>
                <TableCell>{u.status}</TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  暂无会员
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
