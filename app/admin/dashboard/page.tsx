"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { quotaToDollars, formatNumber, abbreviateNumber } from "@/lib/utils";

interface DashboardStats {
  total_users: number;
  total_distributors: number;
  total_consumption: number;
  today_revenue: number;
  active_users_7d: number;
  new_users_7d: number;
}

interface ChartData {
  daily: Array<{ date: string; consumption: number; revenue: number }>;
  monthly: Array<{ date: string; consumption: number; revenue: number }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [statsRes, chartsRes] = await Promise.all([
        api.get<DashboardStats>("/api/admin/dashboard/stats"),
        api.get<ChartData>("/api/admin/dashboard/charts"),
      ]);

      if (!statsRes.success) {
        throw new Error(statsRes.message || "加载统计失败");
      }
      if (!chartsRes.success) {
        throw new Error(chartsRes.message || "加载图表失败");
      }

      setStats(statsRes.data);
      setCharts(chartsRes.data);
    } catch (err: any) {
      setError(err.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-foreground-muted">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-error">{error}</p>
        <button
          onClick={loadData}
          className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover"
        >
          重试
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "总用户数",
      value: formatNumber(stats.total_users),
      sublabel: `7日新增 ${stats.new_users_7d}`,
      icon: "👥",
      color: "text-info",
    },
    {
      label: "分站数",
      value: formatNumber(stats.total_distributors),
      icon: "🌐",
      color: "text-success",
    },
    {
      label: "总消耗",
      value: quotaToDollars(stats.total_consumption),
      icon: "📊",
      color: "text-warning",
    },
    {
      label: "今日收入",
      value: quotaToDollars(stats.today_revenue),
      icon: "💰",
      color: "text-primary",
    },
    {
      label: "7日活跃用户",
      value: formatNumber(stats.active_users_7d),
      icon: "⚡",
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">数据概览</h1>
        <p className="mt-1 text-sm text-foreground-muted">总端管理后台 - 关键指标</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <Card key={card.label} className="flex items-center gap-4">
            <div className={`text-3xl ${card.color}`}>{card.icon}</div>
            <div className="flex-1">
              <p className="text-xs text-foreground-muted">{card.label}</p>
              <p className="text-xl font-bold text-foreground">{card.value}</p>
              {card.sublabel && <p className="text-xs text-foreground-muted">{card.sublabel}</p>}
            </div>
          </Card>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 7日趋势 */}
        <Card>
          <CardHeader>
            <CardTitle>7日消耗趋势</CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.daily && charts.daily.length > 0 ? (
              <div className="space-y-2">
                {charts.daily.map((day) => (
                  <div key={day.date} className="flex items-center justify-between text-sm">
                    <span className="text-foreground-muted">{day.date}</span>
                    <span className="font-medium text-foreground">
                      {quotaToDollars(day.consumption)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-foreground-muted">暂无数据</p>
            )}
          </CardContent>
        </Card>

        {/* 30日趋势 */}
        <Card>
          <CardHeader>
            <CardTitle>30日收入趋势</CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.monthly && charts.monthly.length > 0 ? (
              <div className="space-y-2">
                {charts.monthly.slice(0, 10).map((month) => (
                  <div key={month.date} className="flex items-center justify-between text-sm">
                    <span className="text-foreground-muted">{month.date}</span>
                    <span className="font-medium text-foreground">
                      {quotaToDollars(month.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-foreground-muted">暂无数据</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
