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
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-heading-1 mb-3">商家目录</h1>
        <p className="text-body">
          认证商家多渠道任选，价格透明，服务可评价
        </p>
      </div>

      <div className="grid-auto-fit">
        {merchants.map((merchant) => (
          <MerchantCard key={merchant.id} merchant={merchant} />
        ))}
      </div>
    </div>
  );
}

function MerchantCard({ merchant }: { merchant: Merchant }) {
  return (
    <div className="card">
      {/* Logo + 名称 + 徽章 */}
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-subtle)] text-lg font-bold text-[var(--color-brand)]">
          {merchant.name?.charAt(0) || "M"}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="card-title mb-2">{merchant.name}</h3>
          <div className="badge-group mb-2">
            {merchant.verified && (
              <span className="badge badge-brand">
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
              </span>
            )}
            <span className={merchant.online ? "badge badge-success" : "badge badge-neutral"}>
              <span className={merchant.online ? "status-dot status-dot-success" : ""} />
              {merchant.online ? "在线" : "离线"}
            </span>
          </div>
          <p className="text-small">
            {merchant.model_count} 个模型 · 响应 {merchant.response_time}ms
          </p>
        </div>
      </div>

      {/* 描述 */}
      <p className="card-description mb-4 line-clamp-2">
        {merchant.description}
      </p>

      {/* 模型标签 */}
      <div className="badge-group mb-5">
        {(merchant.model_tags || []).map((tag) => (
          <span key={tag} className="badge badge-neutral">
            {tag}
          </span>
        ))}
      </div>

      <div className="divider" />

      {/* 价格 + 评分 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="price-value mb-1">{merchant.price_range}</p>
          <p className="text-tiny flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-[var(--color-warning)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.97a1 1 0 00.95.69h4.18c.97 0 1.37 1.24.59 1.81l-3.39 2.46a1 1 0 00-.36 1.12l1.29 3.97c.3.92-.75 1.69-1.54 1.12l-3.38-2.46a1 1 0 00-1.18 0l-3.38 2.46c-.79.57-1.84-.2-1.54-1.12l1.29-3.97a1 1 0 00-.36-1.12L2.04 9.4c-.78-.57-.38-1.81.59-1.81h4.18a1 1 0 00.95-.69l1.29-3.97z" />
            </svg>
            {(merchant.rating ?? 0).toFixed(1)}（{merchant.review_count} 评价）·{" "}
            {abbreviateNumber(merchant.view_count ?? 0)} 浏览
          </p>
        </div>
        {/* TODO: 接商家详情页 */}
        <Link href="/models">
          <button className="btn btn-secondary btn-sm">
            查看模型
          </button>
        </Link>
      </div>
    </div>
  );
}
