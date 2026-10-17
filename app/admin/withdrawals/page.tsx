"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher, api } from "@/lib/api";

interface Withdrawal {
  id: number;
  user_id: number;
  username: string;
  amount: number;
  payment_method: string;
  account_info: string;
  status: number;
  applied_at: string;
  processed_at?: string;
  admin_remark?: string;
}

export default function AdminWithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState<number | null>(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const queryParams = new URLSearchParams();
  if (statusFilter !== null) queryParams.set("status", statusFilter.toString());
  queryParams.set("limit", limit.toString());
  queryParams.set("offset", ((page - 1) * limit).toString());

  const { data, error, mutate } = useSWR<{ withdrawals: Withdrawal[]; total: number }>(
    `/api/admin/withdrawals?${queryParams}`,
    fetcher
  );

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showRemarkModal, setShowRemarkModal] = useState<{ id: number; action: "approve" | "reject" } | null>(null);
  const [remark, setRemark] = useState("");

  const handleAction = async (id: number, action: "approve" | "reject", adminRemark: string) => {
    setActionLoading(id);
    try {
      await api.put(`/api/admin/withdrawals/${id}/${action}`, {
        admin_remark: adminRemark,
      });
      alert(action === "approve" ? "审批通过" : "已拒绝");
      mutate();
      setShowRemarkModal(null);
      setRemark("");
    } catch (err: any) {
      alert(err.response?.data?.message || "操作失败");
    } finally {
      setActionLoading(null);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="card">
          <p className="text-error">加载失败：{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <p className="text-center text-secondary">加载中...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / limit);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-heading-1 mb-2">提现审批</h1>
        <p className="text-body">审核用户的返佣提现申请</p>
      </div>

      {/* 筛选 */}
      <div className="card mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setStatusFilter(null)}
            className={`btn btn-sm ${statusFilter === null ? "btn-primary" : "btn-secondary"}`}
          >
            全部
          </button>
          <button
            onClick={() => setStatusFilter(0)}
            className={`btn btn-sm ${statusFilter === 0 ? "btn-primary" : "btn-secondary"}`}
          >
            待审核
          </button>
          <button
            onClick={() => setStatusFilter(1)}
            className={`btn btn-sm ${statusFilter === 1 ? "btn-primary" : "btn-secondary"}`}
          >
            已通过
          </button>
          <button
            onClick={() => setStatusFilter(2)}
            className={`btn btn-sm ${statusFilter === 2 ? "btn-primary" : "btn-secondary"}`}
          >
            已拒绝
          </button>
        </div>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div className="card">
          <p className="text-small mb-1">总申请数</p>
          <p className="text-2xl font-semibold">{data.total}</p>
        </div>
        <div className="card">
          <p className="text-small mb-1">本页显示</p>
          <p className="text-2xl font-semibold">{data.withdrawals.length}</p>
        </div>
        <div className="card">
          <p className="text-small mb-1">总页数</p>
          <p className="text-2xl font-semibold">{totalPages}</p>
        </div>
        <div className="card">
          <p className="text-small mb-1">当前页</p>
          <p className="text-2xl font-semibold">{page}</p>
        </div>
      </div>

      {/* 提现申请列表 */}
      {data.withdrawals.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-secondary">暂无提现申请</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户</th>
                <th className="text-right">金额</th>
                <th>提现方式</th>
                <th>收款账号</th>
                <th>申请时间</th>
                <th>状态</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {data.withdrawals.map((withdrawal) => {
                const statusConfig = {
                  0: { label: "待审核", class: "badge-warning" },
                  1: { label: "已通过", class: "badge-success" },
                  2: { label: "已拒绝", class: "badge-error" },
                }[withdrawal.status] || { label: "未知", class: "badge-neutral" };

                return (
                  <tr key={withdrawal.id}>
                    <td className="font-mono text-sm">{withdrawal.id}</td>
                    <td>
                      <div>
                        <p className="font-medium">{withdrawal.username}</p>
                        <p className="text-tiny text-secondary">ID: {withdrawal.user_id}</p>
                      </div>
                    </td>
                    <td className="text-right font-semibold">
                      ${(withdrawal.amount / 500000).toFixed(2)}
                    </td>
                    <td>
                      {withdrawal.payment_method === "alipay"
                        ? "支付宝"
                        : withdrawal.payment_method === "wechat"
                        ? "微信"
                        : "银行卡"}
                    </td>
                    <td className="text-sm">{withdrawal.account_info}</td>
                    <td className="text-sm text-secondary">
                      {new Date(withdrawal.applied_at).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${statusConfig.class}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="text-sm text-secondary max-w-[200px] truncate">
                      {withdrawal.admin_remark || "-"}
                    </td>
                    <td>
                      {withdrawal.status === 0 ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowRemarkModal({ id: withdrawal.id, action: "approve" })}
                            disabled={actionLoading === withdrawal.id}
                            className="btn btn-primary btn-sm"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => setShowRemarkModal({ id: withdrawal.id, action: "reject" })}
                            disabled={actionLoading === withdrawal.id}
                            className="btn btn-secondary btn-sm"
                          >
                            拒绝
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-secondary">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 分页 */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-secondary">
          共 {data.total} 条记录，第 {page} / {totalPages} 页
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
          >
            上一页
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary btn-sm"
          >
            下一页
          </button>
        </div>
      </div>

      {/* 备注弹窗 */}
      {showRemarkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-heading-3 mb-4">
              {showRemarkModal.action === "approve" ? "审批通过" : "拒绝申请"}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                备注（可选）
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg"
                placeholder={
                  showRemarkModal.action === "approve"
                    ? "例：已打款至支付宝账号"
                    : "例：账号信息不完整，请重新提交"
                }
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRemarkModal(null);
                  setRemark("");
                }}
                className="btn btn-secondary flex-1"
                disabled={actionLoading !== null}
              >
                取消
              </button>
              <button
                onClick={() => handleAction(showRemarkModal.id, showRemarkModal.action, remark)}
                className="btn btn-primary flex-1"
                disabled={actionLoading !== null}
              >
                {actionLoading !== null ? "处理中..." : "确认"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
