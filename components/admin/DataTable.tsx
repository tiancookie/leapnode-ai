"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  keyExtractor: (item: T) => string | number;
  onSearch?: (keyword: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  emptyText?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({
  columns,
  data,
  loading,
  keyExtractor,
  onSearch,
  searchPlaceholder = "搜索...",
  actions,
  emptyText = "暂无数据",
  pagination,
}: DataTableProps<T>) {
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    onSearch?.(keyword);
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* 工具栏 */}
      {(onSearch || actions) && (
        <div className="flex items-center justify-between gap-4">
          {onSearch && (
            <div className="flex gap-2">
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-64"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}>搜索</Button>
            </div>
          )}
          <div className="ml-auto">{actions}</div>
        </div>
      )}

      {/* 表格 */}
      <div className="overflow-x-auto rounded-lg border border-border bg-background-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-background-hover">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-sm font-medium text-foreground-muted",
                    col.width
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-foreground-muted">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>加载中...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-foreground-muted">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="border-b border-border transition-colors hover:bg-background-hover"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-foreground">
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-foreground-muted">
          <div>
            共 {pagination.total} 条，每页 {pagination.pageSize} 条
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              上一页
            </Button>
            <span className="text-foreground">
              {pagination.page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={pagination.page === totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
