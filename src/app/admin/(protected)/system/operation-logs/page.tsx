import { OperationLogService } from "@/modules/rbac/service/operation-log.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function OperationLogsPage() {
  const service = new OperationLogService();
  const { items, total } = await service.list({ page: 1, pageSize: 50 });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        操作日志
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          共 {total} 条
        </span>
      </h1>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>时间</TableHead>
              <TableHead>模块</TableHead>
              <TableHead>动作</TableHead>
              <TableHead>方法</TableHead>
              <TableHead>路径</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>耗时</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {log.createdAt.toISOString().slice(0, 19).replace("T", " ")}
                </TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{log.method}</span>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {log.path}
                </TableCell>
                <TableCell>
                  {log.status === 1 ? (
                    <span className="text-emerald-600">成功</span>
                  ) : (
                    <span className="text-destructive">失败</span>
                  )}
                </TableCell>
                <TableCell>{log.duration}ms</TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  暂无操作记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
