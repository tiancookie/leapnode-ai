"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher, api } from "@/lib/api";

interface MerchantChannel {
  id: number;
  name: string;
  model_name: string;
  status: number; // 0=pending, 1=active, 2=disabled
  input_price: number;
  output_price: number;
  total_calls: number;
  total_revenue: number;
  created_at: string;
}

export default function MerchantChannelsPage() {
  const { data: channels, error, mutate } = useSWR<MerchantChannel[]>(
    "/api/merchant/channels",
    fetcher
  );

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const handleToggleStatus = async (channelId: number, currentStatus: number) => {
    if (!confirm(currentStatus === 1 ? "确定禁用此渠道？" : "确定启用此渠道？")) {
      return;
    }

    setActionLoading(channelId);
    try {
      const newStatus = currentStatus === 1 ? 2 : 1;
      await api.put(`/api/merchant/channels/${channelId}`, { status: newStatus });
      mutate();
      alert("操作成功");
    } catch (err: any) {
      alert(err.response?.data?.message || "操作失败");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (channelId: number) => {
    if (!confirm("确定删除此渠道？此操作不可恢复。")) {
      return;
    }

    setActionLoading(channelId);
    try {
      await api.delete(`/api/merchant/channels/${channelId}`);
      mutate();
      alert("删除成功");
    } catch (err: any) {
      alert(err.response?.data?.message || "删除失败");
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

  if (!channels) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <p className="text-center text-secondary">加载中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* 头部 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 mb-2">渠道管理</h1>
          <p className="text-body">管理您上架的 AI 模型渠道</p>
        </div>
        <Link href="/merchant/channels/create">
          <button className="btn btn-primary">+ 上架新渠道</button>
        </Link>
      </div>

      {/* 渠道列表 */}
      {channels.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-lg mb-4">还没有上架任何渠道</p>
          <Link href="/merchant/channels/create">
            <button className="btn btn-primary">立即上架</button>
          </Link>
        </div>
      ) : (
        <div className="list-gap">
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              loading={actionLoading === channel.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelCard({
  channel,
  onToggleStatus,
  onDelete,
  loading,
}: {
  channel: MerchantChannel;
  onToggleStatus: (id: number, status: number) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}) {
  const statusConfig = {
    0: { label: "待审核", class: "badge-warning" },
    1: { label: "运行中", class: "badge-success" },
    2: { label: "已禁用", class: "badge-neutral" },
  }[channel.status] || { label: "未知", class: "badge-neutral" };

  return (
    <div className="card">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* 左侧：渠道信息 */}
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <h3 className="card-title mb-2">{channel.name}</h3>
              <p className="text-small mb-2">模型：{channel.model_name}</p>
              <div className="badge-group">
                <span className={`badge ${statusConfig.class}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 中间：定价 */}
        <div className="price-grid lg:w-64">
          <div className="price-item">
            <span className="price-label">输入</span>
            <div>
              <span className="price-value">¥{channel.input_price}</span>
              <span className="price-unit">/1M</span>
            </div>
          </div>
          <div className="price-item">
            <span className="price-label">输出</span>
            <div>
              <span className="price-value">¥{channel.output_price}</span>
              <span className="price-unit">/1M</span>
            </div>
          </div>
        </div>

        {/* 右侧：统计 */}
        <div className="lg:w-48">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary">总调用</span>
              <span className="font-medium">{channel.total_calls.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">总收益</span>
              <span className="font-medium text-[var(--color-brand)]">
                ¥{channel.total_revenue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 lg:flex-col">
          <Link href={`/merchant/channels/${channel.id}/edit`}>
            <button className="btn btn-secondary btn-sm w-full" disabled={loading}>
              编辑
            </button>
          </Link>
          {channel.status !== 0 && (
            <button
              onClick={() => onToggleStatus(channel.id, channel.status)}
              disabled={loading}
              className="btn btn-secondary btn-sm w-full"
            >
              {loading ? "..." : channel.status === 1 ? "禁用" : "启用"}
            </button>
          )}
          <button
            onClick={() => onDelete(channel.id)}
            disabled={loading}
            className="btn btn-ghost btn-sm w-full text-red-400"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
