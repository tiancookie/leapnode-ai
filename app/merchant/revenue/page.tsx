"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";

interface RevenueStats {
  total_revenue: number;
  today_revenue: number;
  this_month_revenue: number;
  total_calls: number;
  avg_price_per_call: number;
}

interface RevenueRecord {
  date: string;
  revenue: number;
  calls: number;
}

export default function MerchantRevenuePage() {
  const { data: stats, error: statsError } = useSWR<RevenueStats>(
    "/api/merchant/revenue/stats",
    fetcher
  );
  const { data: records, error: recordsError } = useSWR<RevenueRecord[]>(
    "/api/merchant/revenue/records?days=30",
    fetcher
  );

  if (statsError || recordsError) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="card">
          <p className="text-error">加载失败</p>
        </div>
      </div>
    );
  }

  if (!stats || !records) {
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
        <h1 className="text-heading-1 mb-2">收益统计</h1>
        <p className="text-body">查看您的渠道收益详情</p>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="总收益" value={`¥${stats.total_revenue.toFixed(2)}`} icon="💰" />
        <StatCard title="今日收益" value={`¥${stats.today_revenue.toFixed(2)}`} icon="📊" />
        <StatCard title="本月收益" value={`¥${stats.this_month_revenue.toFixed(2)}`} icon="📈" />
        <StatCard title="平均单价" value={`¥${stats.avg_price_per_call.toFixed(4)}`} icon="💵" />
      </div>

      {/* 收益趋势 */}
      <div className="card mb-8">
        <h3 className="text-heading-3 mb-4">近30日收益趋势</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px] h-64 flex items-end gap-2">
            {records.map((record, idx) => {
              const maxRevenue = Math.max(...records.map((r) => r.revenue));
              const height = maxRevenue > 0 ? (record.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-[var(--color-brand)] rounded-t transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                    title={`${record.date}: ¥${record.revenue.toFixed(2)}`}
                  />
                  <span className="text-tiny mt-2 rotate-45 origin-left whitespace-nowrap">
                    {record.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 收益明细表 */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>日期</th>
              <th className="text-right">调用次数</th>
              <th className="text-right">收益金额</th>
              <th className="text-right">平均单价</th>
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 15).map((record, idx) => (
              <tr key={idx}>
                <td>{record.date}</td>
                <td className="text-right">{record.calls.toLocaleString()}</td>
                <td className="text-right text-[var(--color-brand)]">
                  ¥{record.revenue.toFixed(2)}
                </td>
                <td className="text-right">
                  ¥{record.calls > 0 ? (record.revenue / record.calls).toFixed(4) : "0.0000"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="card">
      <div className="text-2xl mb-3">{icon}</div>
      <p className="text-small mb-1">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
