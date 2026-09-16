"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { cn, abbreviateNumber } from "@/lib/utils";
import type { Model } from "@/lib/types";
import { MOCK_MODELS } from "@/lib/mock";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// 能力过滤标签
const CAPABILITY_TAGS = [
  "文本生成",
  "代码",
  "多模态",
  "推理",
  "长文本",
  "函数调用",
  "联网搜索",
];

// 服务商图标颜色
const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: "#10a37f",
  Anthropic: "#d97757",
  Google: "#4285f4",
  阿里通义: "#ff6a00",
  百度文心: "#2932e1",
  DeepSeek: "#4d6bfe",
  "智谱 AI": "#3859ff",
};

/** 能力评分（mock：按模型名与能力名生成 60-100 的确定性分数） */
// TODO: 接能力评分接口
function capabilityScore(modelName: string, capability: string): number {
  let hash = 0;
  const str = modelName + capability;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 997;
  }
  return 60 + (hash % 41);
}

export default function ModelsPage() {
  const { data, error, isLoading } = useSWR<Model[]>("/api/dist/site/models", fetcher);
  // 接口异常时兜底 mock，不让页面崩溃
  const models = error || !data ? MOCK_MODELS : data;

  const [provider, setProvider] = useState<string | null>(null);
  const [capability, setCapability] = useState<string | null>(null);

  const providers = useMemo(
    () => Array.from(new Set(models.map((m) => m.provider))),
    [models]
  );

  const filtered = models.filter(
    (m) =>
      (!provider || m.provider === provider) &&
      (!capability || m.capabilities.includes(capability))
  );

  return (
    <div className="mx-auto w-full max-w-container px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">模型市场</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          浏览全部接入模型，按供应商与能力筛选，价格透明
        </p>
      </div>

      {/* 过滤器 */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-foreground-muted">供应商：</span>
          <FilterPill active={provider === null} onClick={() => setProvider(null)}>
            全部
          </FilterPill>
          {providers.map((p) => (
            <FilterPill key={p} active={provider === p} onClick={() => setProvider(p)}>
              {p}
            </FilterPill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-foreground-muted">能力：</span>
          <FilterPill active={capability === null} onClick={() => setCapability(null)}>
            全部
          </FilterPill>
          {CAPABILITY_TAGS.map((c) => (
            <FilterPill key={c} active={capability === c} onClick={() => setCapability(c)}>
              {c}
            </FilterPill>
          ))}
        </div>
      </div>

      {/* 模型卡片列表 */}
      {isLoading && !models.length ? (
        <p className="py-16 text-center text-foreground-muted">加载中...</p>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-foreground-muted">没有符合筛选条件的模型</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-background-card text-foreground-muted hover:border-primary/50 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function ModelCard({ model }: { model: Model }) {
  const color = PROVIDER_COLORS[model.provider] || "#00d4aa";
  const scoredCapabilities = model.capabilities.slice(0, 4);

  return (
    <Card className="p-5 transition-colors hover:border-primary/50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* 图标 + 名称 */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-base font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {model.provider.charAt(0)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold text-foreground">{model.display_name}</h3>
              <Badge variant={model.status === 1 ? "success" : "error"}>
                {model.status === 1 ? "可用" : "维护中"}
              </Badge>
              {model.official_direct && <Badge variant="primary">官方直连</Badge>}
              {model.web_search && <Badge variant="info">联网搜索</Badge>}
            </div>
            <p className="mt-1 truncate text-xs text-foreground-muted">
              {model.name} · {model.provider}
            </p>
          </div>
        </div>

        {/* 价格 + 上下文 */}
        <div className="flex shrink-0 gap-6 text-sm lg:w-64">
          <div>
            <p className="text-foreground-muted">输入</p>
            <p className="mt-0.5 font-medium text-foreground">¥{model.input_price}/1M</p>
          </div>
          <div>
            <p className="text-foreground-muted">输出</p>
            <p className="mt-0.5 font-medium text-foreground">¥{model.output_price}/1M</p>
          </div>
          <div>
            <p className="text-foreground-muted">上下文</p>
            <p className="mt-0.5 font-medium text-foreground">
              {abbreviateNumber(model.context_window)}
            </p>
          </div>
        </div>

        {/* 能力评分条 */}
        <div className="flex w-full shrink-0 flex-col gap-1.5 lg:w-52">
          {scoredCapabilities.map((cap) => {
            const score = capabilityScore(model.name, cap);
            return (
              <div key={cap} className="flex items-center gap-2 text-xs">
                <span className="w-14 shrink-0 text-foreground-muted">{cap}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background-hover">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="w-7 text-right text-foreground-muted">{score}</span>
              </div>
            );
          })}
        </div>

        {/* 使用按钮 */}
        <div className="shrink-0">
          <Link href="/console">
            <Button size="sm">使用</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
