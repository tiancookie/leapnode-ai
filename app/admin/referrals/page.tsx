"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { Referral } from "@/lib/types";
import { quotaToDollars, formatTimestamp } from "@/lib/utils";

interface ReferralStats {
  total_amount: number;
  pending_amount: number;
  settled_amount: number;
  total_count: number;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [settling, setSettling] = useState<number | null>(null);

  const PAGE_SIZE = 20;

  useEffect(() => {
    loadReferrals();
    loadStats();
  }, [page]);

  async function loadReferrals() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(PAGE_SIZE),
      });
      const res = await api.get<{ referrals: Referral[]; total: number }>(
        `/api/admin/referrals?${params}`
      );

      if (res.success) {
        setReferrals(res.data.referrals || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("加载返佣记录失败", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res = await api.get<ReferralStats>("/api/admin/referrals/stats");
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("加载统计失败", err);
    }
  }

  async function handleSettle(id: number) {
    if (!confirm("确认结算该返佣？")) return;

    setSettling(id);
    try {
      const res = await api.post(`/api/admin/referrals/${id}/settle`);
      if (res.success) {
        alert("结算成功");
        loadReferrals();
        loadStats();
      } else {
        alert(res.message || "结算失败");
      }
    } catch (err: any) {
      alert(err.message || "结算失败");
    } finally {
      setSettling(null);
    }
  }

  const columns: Column<Referral>[] = [
    {
      key: "id",
      label: "ID",
      width: "w-16",
    },
    {
      key: "user_id",
      label: "用户ID",
    },
    {
      key: "referrer_id",
      label: "推荐人ID",
    },
    {
      key: "amount",
      label: "返佣金额",
      render: (ref) => <span className="font-medium text-primary">{quotaToDollars(ref.amount)}</span>,
    },
    {
      key: "type",
      label: "类型",
      render: (ref) => <span className="text-sm text-foreground-muted">{ref.type}</span>,
    },
    {
      key: "status",
      label: "状态",
      render: (ref) => (
        <Badge variant={ref.status === "settled" ? "success" : "warning"}>
          {ref.status === "settled" ? "已结算" : "待结算"}
        </Badge>
      ),
    },
    {
      key: "created_time",
      label: "创建时间",
      render: (ref) => (
        <span className="text-xs text-foreground-muted">{formatTimestamp(ref.created_time)}</span>
      ),
    },
    {
      key: "settled_at",
      label: "结算时间",
      render: (ref) => (
        <span className="text-xs text-foreground-muted">
          {ref.settled_at ? formatTimestamp(ref.settled_at) : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "操作",
      render: (ref) =>
        ref.status === "pending" ? (
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleSettle(ref.id)}
            loading={settling === ref.id}
          >
            结算
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-1">返佣管理</h1>
        <p className="mt-1 text-sm text-foreground-muted">返佣记录与结算</p>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="text-2xl">💰</div>
              <div>
                <p className="text-xs text-foreground-muted">总返佣金额</p>
                <p className="text-heading-3">{quotaToDollars(stats.total_amount)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="text-2xl">⏳</div>
              <div>
                <p className="text-xs text-foreground-muted">待结算</p>
                <p className="text-lg font-bold text-warning">{quotaToDollars(stats.pending_amount)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="text-2xl">✅</div>
              <div>
                <p className="text-xs text-foreground-muted">已结算</p>
                <p className="text-lg font-bold text-success">{quotaToDollars(stats.settled_amount)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="text-2xl">📊</div>
              <div>
                <p className="text-xs text-foreground-muted">记录总数</p>
                <p className="text-heading-3">{stats.total_count}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={referrals}
        loading={loading}
        keyExtractor={(ref) => ref.id}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
