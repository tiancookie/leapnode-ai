"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher, api } from "@/lib/api";

interface AffStats {
  aff_code: string;
  aff_quota: number;
  aff_history_quota: number;
  invitee_count: number;
  level1_count: number;
  level2_count: number;
}

interface AffEarning {
  id: number;
  amount: number;
  event_type: string;
  invitee_username: string;
  created_at: string;
}

interface AffPayout {
  id: number;
  amount: number;
  status: number;
  payment_method: string;
  account_info: string;
  applied_at: string;
  processed_at?: string;
  admin_remark?: string;
}

export default function ReferralPage() {
  const { data: stats, error: statsError } = useSWR<AffStats>("/api/dist/aff/stats", fetcher);
  const { data: earnings, error: earningsError } = useSWR<AffEarning[]>("/api/dist/aff_earnings?limit=20", fetcher);
  const { data: payouts, error: payoutsError } = useSWR<AffPayout[]>("/api/dist/aff_payouts", fetcher);

  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    payment_method: "alipay",
    account_info: "",
  });
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/dist/aff_withdraw", {
        amount: parseFloat(withdrawForm.amount),
        payment_method: withdrawForm.payment_method,
        account_info: withdrawForm.account_info,
      });
      alert("提现申请已提交，请等待审核");
      setShowWithdrawForm(false);
      setWithdrawForm({ amount: "", payment_method: "alipay", account_info: "" });
      // 重新加载数据
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "提交失败");
    } finally {
      setLoading(false);
    }
  };

  const handleTransferToQuota = async () => {
    if (!stats) return;
    if (!confirm(`确定将 $${(stats.aff_quota / 500000).toFixed(2)} 转入余额吗？`)) return;

    setLoading(true);
    try {
      await api.post("/api/dist/aff_transfer");
      alert("转换成功");
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "转换失败");
    } finally {
      setLoading(false);
    }
  };

  if (statsError) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="card">
          <p className="text-error">加载失败：{statsError.message}</p>
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

  const referralUrl = `${window.location.origin}/register?ref=${stats.aff_code}`;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-heading-1 mb-2">返佣中心</h1>
        <p className="text-body">邀请好友注册充值，赚取返佣收益</p>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="可提现余额"
          value={`$${(stats.aff_quota / 500000).toFixed(2)}`}
          icon="💰"
          highlight
        />
        <StatCard
          title="累计收益"
          value={`$${(stats.aff_history_quota / 500000).toFixed(2)}`}
          icon="📊"
        />
        <StatCard
          title="一级邀请"
          value={stats.level1_count.toString()}
          icon="👤"
        />
        <StatCard
          title="二级邀请"
          value={stats.level2_count.toString()}
          icon="👥"
        />
      </div>

      {/* 邀请链接 */}
      <div className="card mb-8">
        <h3 className="text-heading-3 mb-4">我的邀请链接</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={referralUrl}
            readOnly
            className="flex-1 px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(referralUrl);
              alert("已复制到剪贴板");
            }}
            className="btn btn-primary"
          >
            复制链接
          </button>
        </div>
        <p className="text-small mt-3">
          邀请码：<span className="font-mono font-bold text-[var(--color-brand)]">{stats.aff_code}</span>
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <button
          onClick={() => setShowWithdrawForm(true)}
          disabled={stats.aff_quota === 0 || loading}
          className="btn btn-primary py-4 text-lg"
        >
          💸 申请提现
        </button>
        <button
          onClick={handleTransferToQuota}
          disabled={stats.aff_quota === 0 || loading}
          className="btn btn-secondary py-4 text-lg"
        >
          🔄 转入余额
        </button>
      </div>

      {/* 提现表单弹窗 */}
      {showWithdrawForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-heading-3 mb-4">申请提现</h3>
            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  提现金额（美元） <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  required
                  max={(stats.aff_quota / 500000).toFixed(2)}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg"
                  placeholder={`最多 ${(stats.aff_quota / 500000).toFixed(2)}`}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  提现方式 <span className="text-red-400">*</span>
                </label>
                <select
                  value={withdrawForm.payment_method}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, payment_method: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg"
                >
                  <option value="alipay">支付宝</option>
                  <option value="wechat">微信</option>
                  <option value="bank">银行卡</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  收款账号 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={withdrawForm.account_info}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, account_info: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg"
                  placeholder="支付宝账号/微信号/银行卡号"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawForm(false)}
                  className="btn btn-secondary flex-1"
                  disabled={loading}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? "提交中..." : "提交申请"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 返佣规则 */}
      <div className="card mb-8">
        <h3 className="text-heading-3 mb-4">💡 返佣规则</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-lg font-medium mb-2">注册奖励</p>
            <p className="text-3xl font-bold text-[var(--color-brand)] mb-2">$0.50</p>
            <p className="text-small">好友注册即得</p>
          </div>
          <div>
            <p className="text-lg font-medium mb-2">一级返佣</p>
            <p className="text-3xl font-bold text-[var(--color-brand)] mb-2">10%</p>
            <p className="text-small">好友首充金额的 10%</p>
          </div>
          <div>
            <p className="text-lg font-medium mb-2">二级返佣</p>
            <p className="text-3xl font-bold text-[var(--color-brand)] mb-2">5%</p>
            <p className="text-small">好友的好友首充金额的 5%</p>
          </div>
        </div>
      </div>

      {/* 收益明细 */}
      <div className="card mb-8">
        <h3 className="text-heading-3 mb-4">收益明细</h3>
        {!earnings || earnings.length === 0 ? (
          <p className="text-center text-secondary py-8">暂无收益记录</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>类型</th>
                  <th>来源用户</th>
                  <th className="text-right">金额</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((earning) => (
                  <tr key={earning.id}>
                    <td className="text-sm">
                      {new Date(earning.created_at).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {earning.event_type === "register" ? "注册奖励" : "首充返佣"}
                      </span>
                    </td>
                    <td>{earning.invitee_username}</td>
                    <td className="text-right text-[var(--color-brand)] font-medium">
                      +${(earning.amount / 500000).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 提现记录 */}
      <div className="card">
        <h3 className="text-heading-3 mb-4">提现记录</h3>
        {!payouts || payouts.length === 0 ? (
          <p className="text-center text-secondary py-8">暂无提现记录</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>申请时间</th>
                  <th className="text-right">金额</th>
                  <th>方式</th>
                  <th>账号</th>
                  <th>状态</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => {
                  const statusConfig = {
                    0: { label: "待审核", class: "badge-warning" },
                    1: { label: "已通过", class: "badge-success" },
                    2: { label: "已拒绝", class: "badge-error" },
                  }[payout.status] || { label: "未知", class: "badge-neutral" };

                  return (
                    <tr key={payout.id}>
                      <td className="text-sm">
                        {new Date(payout.applied_at).toLocaleString()}
                      </td>
                      <td className="text-right font-medium">
                        ${(payout.amount / 500000).toFixed(2)}
                      </td>
                      <td>
                        {payout.payment_method === "alipay"
                          ? "支付宝"
                          : payout.payment_method === "wechat"
                          ? "微信"
                          : "银行卡"}
                      </td>
                      <td className="text-sm">{payout.account_info}</td>
                      <td>
                        <span className={`badge ${statusConfig.class}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="text-sm text-secondary">
                        {payout.admin_remark || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  highlight,
}: {
  title: string;
  value: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div className={`card ${highlight ? "border-[var(--color-brand)]" : ""}`}>
      <div className="text-2xl mb-3">{icon}</div>
      <p className="text-small mb-1">{title}</p>
      <p className={`text-2xl font-semibold ${highlight ? "text-[var(--color-brand)]" : ""}`}>
        {value}
      </p>
    </div>
  );
}
