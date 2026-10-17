"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

interface MerchantStats {
  total_revenue: number;
  total_calls: number;
  active_channels: number;
  pending_channels: number;
  status: string;
  company_name: string;
}

export default function MerchantDashboardPage() {
  const { data: stats, error } = useSWR<MerchantStats>("/api/merchant/stats", fetcher);

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="card">
          <p className="text-error">加载失败：{error.message}</p>
          <p className="text-small mt-2">您可能还不是商家，或未登录。</p>
          <Link href="/merchant/apply" className="btn btn-primary mt-4 inline-block">
            申请成为商家
          </Link>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <p className="text-center text-secondary">加载中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-heading-1 mb-2">商家控制台</h1>
        <p className="text-body">欢迎回来，{stats.company_name}</p>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="总收益"
          value={`¥${stats.total_revenue.toFixed(2)}`}
          icon="💰"
          trend="+12.5%"
        />
        <StatCard
          title="总调用量"
          value={stats.total_calls.toLocaleString()}
          icon="📊"
          trend="+8.3%"
        />
        <StatCard
          title="活跃渠道"
          value={stats.active_channels.toString()}
          icon="🔗"
        />
        <StatCard
          title="待审核渠道"
          value={stats.pending_channels.toString()}
          icon="⏳"
          alert={stats.pending_channels > 0}
        />
      </div>

      {/* 快速操作 */}
      <div className="mb-8">
        <h2 className="text-heading-2 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ActionCard
            title="管理渠道"
            description="查看和管理您的模型渠道"
            icon="🔧"
            href="/merchant/channels"
          />
          <ActionCard
            title="收益统计"
            description="查看详细的收益报表"
            icon="📈"
            href="/merchant/revenue"
          />
          <ActionCard
            title="上架新渠道"
            description="添加新的 AI 模型渠道"
            icon="➕"
            href="/merchant/channels/create"
          />
        </div>
      </div>

      {/* 最近动态 */}
      <div className="card">
        <h3 className="text-heading-3 mb-4">最近动态</h3>
        <div className="space-y-3">
          <ActivityItem
            time="2 小时前"
            content="渠道 gpt-4o-merchant-001 审核通过"
            type="success"
          />
          <ActivityItem
            time="1 天前"
            content="收益 ¥128.50 已结算到余额"
            type="info"
          />
          <ActivityItem
            time="3 天前"
            content="新增渠道 claude-sonnet-merchant-002 待审核"
            type="warning"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  alert,
}: {
  title: string;
  value: string;
  icon: string;
  trend?: string;
  alert?: boolean;
}) {
  return (
    <div className={`card ${alert ? 'border-[var(--color-warning)]' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className="text-xs text-[var(--color-success)]">{trend}</span>
        )}
      </div>
      <p className="text-small mb-1">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="card hover:border-[var(--color-brand)] transition-all cursor-pointer h-full">
        <div className="text-3xl mb-3">{icon}</div>
        <h4 className="text-lg font-medium mb-2">{title}</h4>
        <p className="text-small">{description}</p>
      </div>
    </Link>
  );
}

function ActivityItem({
  time,
  content,
  type,
}: {
  time: string;
  content: string;
  type: "success" | "info" | "warning" | "error";
}) {
  const dotClass = {
    success: "status-dot-success",
    info: "bg-[var(--color-info)]",
    warning: "status-dot-warning",
    error: "status-dot-error",
  }[type];

  return (
    <div className="flex items-start gap-3 py-2">
      <span className={`status-dot ${dotClass} mt-1.5`} />
      <div className="flex-1">
        <p className="text-sm">{content}</p>
        <p className="text-tiny mt-0.5">{time}</p>
      </div>
    </div>
  );
}
