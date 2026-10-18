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

// Mock: 能力评分
function capabilityScore(modelName: string, capability: string): number {
  const hash = modelName.length + capability.length;
  return 70 + ((hash * 7) % 30);
}

export default function ModelsPage() {
  const { data: models = MOCK_MODELS, isLoading } = useSWR<Model[]>(
    "/api/models/public",
    fetcher
  );

  const [provider, setProvider] = useState<string | null>(null);
  const [capability, setCapability] = useState<string | null>(null);

  const providers = useMemo(
    () => Array.from(new Set(models.map((m) => m.provider).filter((p): p is string => Boolean(p)))),
    [models]
  );

  const filtered = useMemo(() => {
    return models.filter((m) => {
      if (provider && m.provider !== provider) return false;
      if (capability && !m.capabilities?.includes(capability)) return false;
      return true;
    });
  }, [models, provider, capability]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* 标题 */}
      <div className="mb-8">
        <h1 className="text-heading-1 mb-3">模型市场</h1>
        <p className="text-body">
          汇聚全球主流大模型，统一 API 接口，透明定价，按需调用
        </p>
      </div>

      {/* 筛选标签 */}
      <div className="section-spacing flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-secondary">供应商：</span>
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
          <span className="text-sm text-secondary">能力：</span>
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
        <p className="py-16 text-center text-secondary">加载中...</p>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-secondary">没有符合筛选条件的模型</p>
      ) : (
        <div className="list-gap">
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
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
        active
          ? "border-[var(--color-brand)] bg-[var(--color-brand-subtle)] text-[var(--color-brand)]"
          : "border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--text-primary)]"
      )}
    >
      {children}
    </button>
  );
}

function ModelCard({ model }: { model: Model }) {
  const provider = model.provider || "";
  const color = PROVIDER_COLORS[provider] || "#00d4aa";
  const scoredCapabilities = (model.capabilities || []).slice(0, 4);

  return (
    <div className="card">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* 左侧：图标 + 名称 */}
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {provider.charAt(0) || "?"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-2">
              <h3 className="card-title mb-2">{model.display_name}</h3>
              <p className="text-small mb-3">
                {model.name} · {model.provider}
              </p>
              <div className="badge-group">
                <span className={model.status === 1 ? "badge badge-success" : "badge badge-error"}>
                  {model.status === 1 ? "可用" : "维护中"}
                </span>
                {model.official_direct && <span className="badge badge-info">官方直连</span>}
                {model.web_search && <span className="badge badge-brand">联网搜索</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 中间：价格 + 上下文 */}
        <div className="price-grid lg:w-80">
          <div className="price-item">
            <span className="price-label">📥 输入</span>
            <div>
              <span className="price-value">¥{model.input_price}</span>
              <span className="price-unit">/1M</span>
            </div>
          </div>
          <div className="price-item">
            <span className="price-label">📤 输出</span>
            <div>
              <span className="price-value">¥{model.output_price}</span>
              <span className="price-unit">/1M</span>
            </div>
          </div>
          <div className="price-item">
            <span className="price-label">📄 上下文</span>
            <span className="price-value">{abbreviateNumber(model.context_window ?? 0)}</span>
          </div>
        </div>

        {/* 右侧：能力评分 */}
        <div className="metric-list lg:w-64">
          {scoredCapabilities.map((cap) => {
            const score = capabilityScore(model.name, cap);
            const scoreLevel = score >= 90 ? "high" : score >= 70 ? "medium" : "low";
            return (
              <div key={cap} className="metric-item">
                <span className="metric-label">{cap}</span>
                <span className="metric-value">{score}</span>
                <div className="metric-bar">
                  <div
                    className="metric-bar-fill"
                    data-score={scoreLevel}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 操作按钮 */}
        <div className="shrink-0">
          <Link href="/console">
            <button className="btn btn-primary">使用</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
