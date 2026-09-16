"use client";

import Link from "next/link";
import { abbreviateNumber } from "@/lib/utils";
import type { Merchant } from "@/lib/types";
import { MOCK_MERCHANTS } from "@/lib/mock";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function MerchantsPage() {
  // TODO: 接商家目录接口（后端暂未提供 merchant 端点），就绪后改为 SWR 拉取
  const merchants = MOCK_MERCHANTS;

  return (
    <div className="mx-auto w-full max-w-container px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">商家目录</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          认证商家多渠道任选，价格透明，服务可评价
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {merchants.map((merchant) => (
          <MerchantCard key={merchant.id} merchant={merchant} />
        ))}
      </div>
    </div>
  );
}

function MerchantCard({ merchant }: { merchant: Merchant }) {
  return (
    <Card className="flex flex-col p-5 transition-colors hover:border-primary/50">
      {/* Logo + 名称 + 徽章 */}
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/20 text-base font-bold text-primary">
          {merchant.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-foreground">{merchant.name}</h3>
            {merchant.verified && (
              <Badge variant="primary">
                <svg
                  className="mr-1 h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                    clipRule="evenodd"
                  />
                </svg>
                已认证
              </Badge>
            )}
            <Badge variant={merchant.online ? "success" : "neutral"}>
              {merchant.online ? "在线" : "离线"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            {merchant.model_count} 个模型 · 响应 {merchant.response_time}ms
          </p>
        </div>
      </div>

      {/* 描述 */}
      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-foreground-muted">
        {merchant.description}
      </p>

      {/* 模型标签 */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {merchant.model_tags.map((tag) => (
          <Badge key={tag} variant="neutral">
            {tag}
          </Badge>
        ))}
      </div>

      {/* 价格 + 评分 */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-sm font-medium text-primary">{merchant.price_range}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-foreground-muted">
            <svg className="h-3.5 w-3.5 text-warning" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.97a1 1 0 00.95.69h4.18c.97 0 1.37 1.24.59 1.81l-3.39 2.46a1 1 0 00-.36 1.12l1.29 3.97c.3.92-.75 1.69-1.54 1.12l-3.38-2.46a1 1 0 00-1.18 0l-3.38 2.46c-.79.57-1.84-.2-1.54-1.12l1.29-3.97a1 1 0 00-.36-1.12L2.04 9.4c-.78-.57-.38-1.81.59-1.81h4.18a1 1 0 00.95-.69l1.29-3.97z" />
            </svg>
            {merchant.rating.toFixed(1)}（{merchant.review_count} 评价）·{" "}
            {abbreviateNumber(merchant.view_count)} 浏览
          </p>
        </div>
        {/* TODO: 接商家详情页 */}
        <Link href="/models">
          <Button size="sm" variant="secondary">
            查看模型
          </Button>
        </Link>
      </div>
    </Card>
  );
}
