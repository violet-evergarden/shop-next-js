import type {
  IOperationLogRepository,
  CreateOperationLogInput,
  OperationLogQuery,
} from "../repository";
import { createOperationLogRepository } from "../repository";

/**
 * 操作日志服务。
 * record 内部 catch —— 日志写入失败绝不影响主业务流程。
 */
export class OperationLogService {
  constructor(
    private readonly logs: IOperationLogRepository = createOperationLogRepository(),
  ) {}

  async record(input: CreateOperationLogInput): Promise<void> {
    try {
      await this.logs.create(input);
    } catch (e) {
      console.error("[OperationLog] 记录失败:", e);
    }
  }

  async list(query: OperationLogQuery) {
    return this.logs.findMany(query);
  }
}
