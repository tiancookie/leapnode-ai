"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

interface DistributorStats {
  site_name: string;
  total_users: number;
  active_users: number;
  total_revenue: number;
  today_revenue: number;
  enabled_channels: number;
  enabled_subscriptions: number;
}

export default function DistributorDashboardPage() {
  const { data: stats, error } = useSWR<DistributorStats>(
    "/api/distributor/stats",
    fetcher
  );

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="card">
          <p className="text-error">加载失败：{error.message}</p>
          <p className="text-small mt-2">您可能还不是分站，或未登录。</p>
          <Link href="/distributor/apply" className="btn btn-primary mt-4 inline-block">
            申请成为分站
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
        <h1 className="text-heading-1 mb-2">分站控制台</h1>
        <p className="text-body">欢迎回来，{stats.site_name}</p>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="总用户数"
          value={stats.total_users.toString()}
          icon="👥"
          subtitle={`活跃 ${stats.active_users} 人`}
        />
        <StatCard
          title="总收益"
          value={`¥${stats.total_revenue.toFixed(2)}`}
          icon="💰"
          trend="+15.3%"
        />
        <StatCard
          title="今日收益"
          value={`¥${stats.today_revenue.toFixed(2)}`}
          icon="📊"
        />
        <StatCard
          title="启用产品"
          value={`${stats.enabled_channels + stats.enabled_subscriptions}`}
          icon="🔗"
          subtitle={`渠道 ${stats.enabled_channels} · 订阅 ${stats.enabled_subscriptions}`}
        />
      </div>

      {/* 快速操作 */}
      <div className="mb-8">
        <h2 className="text-heading-2 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <ActionCard
            title="渠道管理"
            description="选品和定价"
            icon="🛒"
            href="/distributor/channels"
          />
          <ActionCard
            title="订阅管理"
            description="套餐选品"
            icon="📦"
            href="/distributor/subscriptions"
          />
          <ActionCard
            title="用户管理"
            description="查看用户列表"
            icon="👤"
            href="/distributor/users"
          />
          <ActionCard
            title="收益统计"
            description="查看收益报表"
            icon="📈"
            href="/distributor/revenue"
          />
        </div>
      </div>

      {/* 用户增长趋势 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="card">
          <h3 className="text-heading-3 mb-4">用户增长</h3>
          <div className="h-48 flex items-center justify-center text-secondary">
            <p>近7日新增用户趋势图（待接入图表库）</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-heading-3 mb-4">收益趋势</h3>
          <div className="h-48 flex items-center justify-center text-secondary">
            <p>近7日收益趋势图（待接入图表库）</p>
          </div>
        </div>
      </div>

      {/* 最近动态 */}
      <div className="card">
        <h3 className="text-heading-3 mb-4">最近动态</h3>
        <div className="space-y-3">
          <ActivityItem
            time="1 小时前"
            content="新用户注册：user_12345"
            type="info"
          />
          <ActivityItem
            time="3 小时前"
            content="启用官方渠道：GPT-4o"
            type="success"
          />
          <ActivityItem
            time="1 天前"
            content="收益 ¥238.60 已结算"
            type="info"
          />
          <ActivityItem
            time="2 天前"
            content="订阅共享套餐定价已更新"
            type="info"
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
  subtitle,
  trend,
}: {
  title: string;
  value: string;
  icon: string;
  subtitle?: string;
  trend?: string;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className="text-xs text-[var(--color-success)]">{trend}</span>
        )}
      </div>
      <p className="text-small mb-1">{title}</p>
      <p className="text-2xl font-semibold mb-1">{value}</p>
      {subtitle && <p className="text-tiny">{subtitle}</p>}
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
