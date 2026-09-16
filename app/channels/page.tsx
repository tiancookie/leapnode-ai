"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { Channel } from "@/lib/types";
import { MOCK_CHANNELS } from "@/lib/mock";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function availabilityVariant(value: number): "success" | "warning" | "error" {
  if (value >= 90) return "success";
  if (value >= 70) return "warning";
  return "error";
}

export default function ChannelsPage() {
  const { data, error, isLoading } = useSWR<Channel[]>(
    "/api/dist/site/official-channels",
    fetcher
  );
  // 接口异常时兜底 mock，不让页面崩溃
  const channels = error || !data ? MOCK_CHANNELS : data;

  return (
    <div className="mx-auto w-full max-w-container px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">官方渠道</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          官方 API Key 直连，按官方价 1:1 计费，稳定可靠
        </p>
      </div>

      {isLoading && !channels.length ? (
        <p className="py-16 text-center text-foreground-muted">加载中...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {channels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Card className="p-5 transition-colors hover:border-primary/50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* 渠道信息 */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/20 text-base font-bold text-primary">
            {channel.provider.charAt(0)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-foreground">{channel.name}</h3>
              <Badge variant={availabilityVariant(channel.key_availability)}>
                密钥可用 {channel.key_availability}%
              </Badge>
              <Badge variant={availabilityVariant(channel.model_availability)}>
                模型可用 {channel.model_availability}%
              </Badge>
              <Badge variant="neutral">{channel.ratio}</Badge>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">
              {channel.description}
            </p>
            <p className="mt-2 text-xs text-foreground-disabled">
              已注册 {channel.registered_models} 个模型 · 已激活 {channel.activated_models} 个 ·
              可用密钥 {channel.available_keys} 个
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex shrink-0 gap-2">
          <a href={channel.official_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="secondary">
              官网
            </Button>
          </a>
          <Link href="/console">
            <Button size="sm">使用</Button>
          </Link>
        </div>
      </div>

      {/* 模型列表 */}
      {channel.models.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-2 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {channel.models.map((model) => (
            <div
              key={model.name}
              className="flex items-center justify-between gap-2 rounded-md bg-background px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{model.name}</p>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  ¥{model.input_price}/1M 入 · ¥{model.output_price}/1M 出
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                {model.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
