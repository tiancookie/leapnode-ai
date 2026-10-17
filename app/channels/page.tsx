"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { Channel } from "@/lib/types";
import { MOCK_CHANNELS } from "@/lib/mock";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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
  const channels = error || !data ? MOCK_CHANNELS : data;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-heading-1 mb-3">官方渠道</h1>
        <p className="text-body">
          LeapNode 官方直连的大模型服务商，稳定可靠，透明定价
        </p>
      </div>

      {isLoading && !channels.length ? (
        <p className="py-16 text-center text-secondary">加载中...</p>
      ) : (
        <div className="list-gap">
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
    <div className="card">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* 左侧：图标 + 信息 */}
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white"
            style={{ backgroundColor: (channel as any).icon_color || "#00d4aa" }}
          >
            {(channel.provider || "?").charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="card-title mb-2">{channel.name}</h3>
            <p className="text-small mb-3">{channel.provider}</p>
            <div className="badge-group mb-3">
              <Badge variant={availabilityVariant(channel.model_availability ?? 0)}>
                模型可用 {channel.model_availability}%
              </Badge>
              <Badge variant="neutral">{channel.ratio}</Badge>
            </div>
            <p className="text-small mb-2">{channel.description}</p>
            <p className="text-tiny">
              已注册 {channel.registered_models} 个模型 · 已激活{" "}
              {channel.activated_models} 个 · 可用密钥 {channel.available_keys} 个
            </p>
          </div>
        </div>

        {/* 右侧：操作按钮 */}
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
      {Array.isArray(channel.models) && channel.models.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {channel.models.map((model: any) => (
              <div
                key={model.name}
                className="flex items-center justify-between gap-3 rounded-lg bg-[var(--bg-tertiary)] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{model.name}</p>
                  <p className="text-tiny mt-1">
                    ¥{model.input_price}/1M 入 · ¥{model.output_price}/1M 出
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {model.tags?.slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="neutral">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
