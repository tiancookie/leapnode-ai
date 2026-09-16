"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { useUserStore } from "@/lib/store";
import { quotaToDollars, quotaToCNY, formatNumber, cn } from "@/lib/utils";
import type { Model, PaginatedResponse, TopupRecord, UsageLog, User } from "@/lib/types";
import { MOCK_MODELS, MOCK_USAGE_LOGS } from "@/lib/mock";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function ConsoleContent() {
  const storeUser = useUserStore((s) => s.user);

  // 用户信息（余额等）
  const { data: self } = useSWR<User>("/api/dist/user/self", fetcher);
  const user = self ?? storeUser;

  // 模型列表（接口异常时兜底 mock）
  const { data: models, error: modelsError } = useSWR<Model[]>(
    "/api/dist/site/models",
    fetcher
  );
  const modelList = (modelsError || !models ? MOCK_MODELS : models).slice(0, 6);

  // 充值记录（作为账单流水的一部分）
  const { data: history } = useSWR<PaginatedResponse<TopupRecord>>(
    "/api/dist/topup/history?page=1&page_size=10",
    fetcher
  );

  // 使用记录：充值记录映射 + mock API 调用记录
  // TODO: 接使用记录接口（usage log），替换 MOCK_USAGE_LOGS
  const topupLogs: UsageLog[] = (history?.records ?? []).map((r) => ({
    id: r.id + 1_000_000,
    created_at: r.created_at,
    event_type: r.method || "充值",
    model_name: "-",
    amount: r.amount,
    balance: 0,
    status: r.status,
  }));
  const usageLogs: UsageLog[] = [...topupLogs, ...MOCK_USAGE_LOGS].slice(0, 10);

  // 顶部统计
  // TODO: 接今日调用/本月消费/成功率统计接口
  const stats = [
    {
      label: "余额",
      value: user ? quotaToDollars(user.quota) : "--",
      sub: user ? `≈ ${quotaToCNY(user.quota)}` : "",
    },
    {
      label: "今日调用",
      value: user ? formatNumber(user.request_count) : "--",
      sub: "累计请求次数",
    },
    {
      label: "本月消费",
      value: user ? quotaToDollars(user.used_quota) : "--",
      sub: "累计消费额度",
    },
    {
      label: "成功率",
      value: "99.2%",
      sub: "近 7 天",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-container px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">控制台</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            欢迎回来，{user?.display_name || user?.username || "用户"}
          </p>
        </div>
        <Link href="/wallet">
          <Button size="sm">充值</Button>
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-sm text-foreground-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
            {stat.sub && <p className="mt-1 text-xs text-foreground-disabled">{stat.sub}</p>}
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* 左：模型卡片网格 */}
        <div className="xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">热门模型</h2>
            <Link href="/models" className="text-sm text-primary hover:text-primary-hover">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {modelList.map((model) => (
              <Card key={model.id} className="p-4 transition-colors hover:border-primary/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{model.display_name}</p>
                    <p className="mt-0.5 text-xs text-foreground-muted">{model.provider}</p>
                  </div>
                  {model.official_direct && <Badge variant="primary">官方直连</Badge>}
                </div>
                <p className="mt-3 text-xs text-foreground-muted">
                  输入 ¥{model.input_price}/1M · 输出 ¥{model.output_price}/1M
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* 右：使用记录表格 */}
        <div className="xl:col-span-3">
          <h2 className="mb-3 text-lg font-semibold text-foreground">使用记录</h2>
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-foreground-muted">
                  <th className="px-4 py-3 font-medium">时间</th>
                  <th className="px-4 py-3 font-medium">操作类型</th>
                  <th className="px-4 py-3 font-medium">模型</th>
                  <th className="px-4 py-3 font-medium">消费</th>
                  <th className="px-4 py-3 font-medium">余额</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {usageLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-foreground-muted">
                      暂无使用记录
                    </td>
                  </tr>
                ) : (
                  usageLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border/50 last:border-0 hover:bg-background-hover"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-foreground-muted">
                        {log.created_at}
                      </td>
                      <td className="px-4 py-3 text-foreground">{log.event_type}</td>
                      <td className="px-4 py-3 text-foreground-muted">{log.model_name}</td>
                      <td
                        className={cn(
                          "whitespace-nowrap px-4 py-3 font-medium",
                          log.amount >= 0 ? "text-success" : "text-foreground"
                        )}
                      >
                        {log.amount >= 0 ? "+" : ""}
                        {log.amount.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-foreground-muted">
                        {log.balance > 0 ? `$${log.balance.toFixed(2)}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={log.status === 1 ? "success" : "error"}>
                          {log.status === 1 ? "成功" : "失败"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ConsolePage() {
  return (
    <AuthGuard>
      <ConsoleContent />
    </AuthGuard>
  );
}
