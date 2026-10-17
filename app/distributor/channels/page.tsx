"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher, api } from "@/lib/api";

interface OfficialChannel {
  id: number;
  name: string;
  model_name: string;
  base_input_price: number;
  base_output_price: number;
  enabled: boolean;
  my_input_price?: number;
  my_output_price?: number;
}

export default function DistributorChannelsPage() {
  const { data: channels, error, mutate } = useSWR<OfficialChannel[]>(
    "/api/distributor/official-channels",
    fetcher
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const [prices, setPrices] = useState<{ input: string; output: string }>({ input: "", output: "" });
  const [loading, setLoading] = useState(false);

  const handleEdit = (channel: OfficialChannel) => {
    setEditingId(channel.id);
    setPrices({
      input: channel.my_input_price?.toString() || channel.base_input_price.toString(),
      output: channel.my_output_price?.toString() || channel.base_output_price.toString(),
    });
  };

  const handleSave = async (channelId: number) => {
    setLoading(true);
    try {
      await api.put(`/api/distributor/official-channels/${channelId}/pricing`, {
        input_price: parseFloat(prices.input),
        output_price: parseFloat(prices.output),
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

  const handleToggle = async (channelId: number, currentEnabled: boolean) => {
    setLoading(true);
    try {
      if (currentEnabled) {
        await api.delete(`/api/distributor/official-channels/${channelId}/disable`);
      } else {
        await api.post(`/api/distributor/official-channels/${channelId}/enable`);
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

  if (!channels) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <p className="text-center text-secondary">加载中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-heading-1 mb-3">官方渠道管理</h1>
        <p className="text-body">从官方渠道池选择模型，自主定价后上架到您的分站</p>
      </div>

      <div className="list-gap">
        {channels.map((channel) => (
          <div key={channel.id} className="card">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* 左侧：渠道信息 */}
              <div className="flex-1">
                <h3 className="card-title mb-2">{channel.name}</h3>
                <p className="text-small mb-2">模型：{channel.model_name}</p>
                <div className="badge-group">
                  <span className={channel.enabled ? "badge badge-success" : "badge badge-neutral"}>
                    {channel.enabled ? "已启用" : "未启用"}
                  </span>
                </div>
              </div>

              {/* 中间：定价 */}
              <div className="lg:w-96">
                {editingId === channel.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-sm w-16">输入</label>
                      <input
                        type="number"
                        step="0.01"
                        value={prices.input}
                        onChange={(e) => setPrices({ ...prices, input: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded text-sm"
                        placeholder="成本价"
                      />
                      <span className="text-sm text-secondary">¥/1M</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm w-16">输出</label>
                      <input
                        type="number"
                        step="0.01"
                        value={prices.output}
                        onChange={(e) => setPrices({ ...prices, output: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded text-sm"
                        placeholder="成本价"
                      />
                      <span className="text-sm text-secondary">¥/1M</span>
                    </div>
                    <p className="text-tiny">
                      成本：输入 ¥{channel.base_input_price} / 输出 ¥{channel.base_output_price}
                    </p>
                  </div>
                ) : (
                  <div className="price-grid">
                    <div className="price-item">
                      <span className="price-label">输入售价</span>
                      <div>
                        <span className="price-value">
                          ¥{channel.my_input_price || channel.base_input_price}
                        </span>
                        <span className="price-unit">/1M</span>
                      </div>
                      <p className="text-tiny">成本 ¥{channel.base_input_price}</p>
                    </div>
                    <div className="price-item">
                      <span className="price-label">输出售价</span>
                      <div>
                        <span className="price-value">
                          ¥{channel.my_output_price || channel.base_output_price}
                        </span>
                        <span className="price-unit">/1M</span>
                      </div>
                      <p className="text-tiny">成本 ¥{channel.base_output_price}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2 lg:flex-col">
                {editingId === channel.id ? (
                  <>
                    <button
                      onClick={() => handleSave(channel.id)}
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
                      onClick={() => handleEdit(channel)}
                      disabled={loading}
                      className="btn btn-secondary btn-sm"
                    >
                      定价
                    </button>
                    <button
                      onClick={() => handleToggle(channel.id, channel.enabled)}
                      disabled={loading}
                      className="btn btn-secondary btn-sm"
                    >
                      {loading ? "..." : channel.enabled ? "禁用" : "启用"}
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
