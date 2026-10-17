"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher, api } from "@/lib/api";

interface SubscriptionShare {
  id: number;
  package_name: string;
  description: string;
  quota: number;
  duration_days: number;
  base_price: number;
  enabled: boolean;
  my_price?: number;
}

export default function DistributorSubscriptionsPage() {
  const { data: subscriptions, error, mutate } = useSWR<SubscriptionShare[]>(
    "/api/distributor/subscription-shares",
    fetcher
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEdit = (sub: SubscriptionShare) => {
    setEditingId(sub.id);
    setPrice(sub.my_price?.toString() || sub.base_price.toString());
  };

  const handleSave = async (subId: number) => {
    setLoading(true);
    try {
      await api.put(`/api/distributor/subscription-shares/${subId}/pricing`, {
        price: parseFloat(price),
      });
      mutate();
      setEditingId(null);
      alert("定价更新成功");
    } catch (err: any) {
      alert(err.response?.data?.message || "操作失败");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (subId: number, currentEnabled: boolean) => {
    setLoading(true);
    try {
      if (currentEnabled) {
        await api.delete(`/api/distributor/subscription-shares/${subId}/disable`);
      } else {
        await api.post(`/api/distributor/subscription-shares/${subId}/enable`);
      }
      mutate();
      alert(currentEnabled ? "已禁用" : "已启用");
    } catch (err: any) {
      alert(err.response?.data?.message || "操作失败");
    } finally {
      setLoading(false);
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

  if (!subscriptions) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <p className="text-center text-secondary">加载中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-heading-1 mb-3">订阅共享管理</h1>
        <p className="text-body">从官方订阅共享池选择套餐，定价后上架到您的分站</p>
      </div>

      <div className="list-gap">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="card">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* 左侧：套餐信息 */}
              <div className="flex-1">
                <h3 className="card-title mb-2">{sub.package_name}</h3>
                <p className="text-small mb-3">{sub.description}</p>
                <div className="badge-group">
                  <span className="badge badge-info">
                    {(sub.quota / 500000).toFixed(2)} 美元
                  </span>
                  <span className="badge badge-neutral">
                    {sub.duration_days} 天
                  </span>
                  <span className={sub.enabled ? "badge badge-success" : "badge badge-neutral"}>
                    {sub.enabled ? "已启用" : "未启用"}
                  </span>
                </div>
              </div>

              {/* 中间：定价 */}
              <div className="lg:w-64">
                {editingId === sub.id ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">售价（¥）</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg"
                      placeholder="成本价"
                    />
                    <p className="text-tiny mt-1">成本价：¥{sub.base_price}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-small mb-1">售价</p>
                    <p className="text-2xl font-semibold text-[var(--color-brand)] mb-1">
                      ¥{sub.my_price || sub.base_price}
                    </p>
                    <p className="text-tiny">成本 ¥{sub.base_price}</p>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2 lg:flex-col">
                {editingId === sub.id ? (
                  <>
                    <button
                      onClick={() => handleSave(sub.id)}
                      disabled={loading}
                      className="btn btn-primary btn-sm"
                    >
                      {loading ? "..." : "保存"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      disabled={loading}
                      className="btn btn-secondary btn-sm"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(sub)}
                      disabled={loading}
                      className="btn btn-secondary btn-sm"
                    >
                      定价
                    </button>
                    <button
                      onClick={() => handleToggle(sub.id, sub.enabled)}
                      disabled={loading}
                      className="btn btn-secondary btn-sm"
                    >
                      {loading ? "..." : sub.enabled ? "禁用" : "启用"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
