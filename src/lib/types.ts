/**
 * 全局共享类型:分页 / 排序。
 * 所有领域 repository 的列表查询统一复用,避免每个模块各写一套。
 */

/** 分页输入(1-based 页码) */
export interface PaginationInput {
  page: number;
  pageSize: number;
}

/** 分页结果 */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** 排序方向 */
export type SortOrder = "asc" | "desc";

/** 通用排序输入 */
export interface SortInput {
  field: string;
  order: SortOrder;
}

/** 计算分页跳过量 */
export function toSkip(p: PaginationInput): number {
  return Math.max(0, (p.page - 1) * p.pageSize);
}

/** 由 items + total 组装分页结果 */
export function toPaginated<T>(
  items: T[],
  total: number,
  p: PaginationInput,
): Paginated<T> {
  return {
    items,
    total,
    page: p.page,
    pageSize: p.pageSize,
    totalPages: p.pageSize > 0 ? Math.ceil(total / p.pageSize) : 0,
  };
}
