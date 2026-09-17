"use client";

import { useEffect, useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { Channel } from "@/lib/types";

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "1",
    key: "",
    base_url: "",
    models: "",
    status: 1,
    priority: "0",
  });

  useEffect(() => {
    loadChannels();
  }, []);

  async function loadChannels() {
    setLoading(true);
    try {
      const res = await api.get<Channel[]>("/api/admin/channels");
      if (res.success) {
        setChannels(res.data || []);
      }
    } catch (err) {
      console.error("加载渠道失败", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingChannel(null);
    setFormData({
      name: "",
      type: "1",
      key: "",
      base_url: "",
      models: "",
      status: 1,
      priority: "0",
    });
    setModalOpen(true);
  }

  function openEditModal(channel: Channel) {
    setEditingChannel(channel);
    const modelsStr = typeof channel.models === "string" ? channel.models : "";
    setFormData({
      name: channel.name,
      type: String(channel.type || 1),
      key: channel.key || "",
      base_url: channel.base_url || "",
      models: modelsStr,
      status: channel.status || 1,
      priority: String(channel.priority || 0),
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.key) {
      alert("请填写必填字段");
      return;
    }

    const payload = {
      name: formData.name,
      type: parseInt(formData.type),
      key: formData.key,
      base_url: formData.base_url,
      models: formData.models,
      status: formData.status,
      priority: parseInt(formData.priority),
    };

    setSaving(true);
    try {
      const res = editingChannel
        ? await api.put(`/api/admin/channels/${editingChannel.id}`, payload)
        : await api.post("/api/admin/channels", payload);

      if (res.success) {
        alert(editingChannel ? "保存成功" : "创建成功");
        setModalOpen(false);
        loadChannels();
      } else {
        alert(res.message || "保存失败");
      }
    } catch (err: any) {
      alert(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确认删除该渠道？")) return;

    try {
      const res = await api.delete(`/api/admin/channels/${id}`);
      if (res.success) {
        alert("删除成功");
        loadChannels();
      } else {
        alert(res.message || "删除失败");
      }
    } catch (err: any) {
      alert(err.message || "删除失败");
    }
  }

  const columns: Column<Channel>[] = [
    {
      key: "id",
      label: "ID",
      width: "w-16",
    },
    {
      key: "name",
      label: "渠道名称",
      render: (ch) => <span className="font-medium text-foreground">{ch.name}</span>,
    },
    {
      key: "type",
      label: "类型",
      render: (ch) => <span className="text-sm text-foreground-muted">Type {ch.type}</span>,
    },
    {
      key: "base_url",
      label: "Base URL",
      render: (ch) => <span className="text-xs text-foreground-muted">{ch.base_url || "-"}</span>,
    },
    {
      key: "models",
      label: "模型",
      render: (ch) => {
        const modelsStr = typeof ch.models === "string" ? ch.models : "";
        return (
          <span className="text-xs text-foreground-muted">
            {modelsStr ? modelsStr.split(",").slice(0, 3).join(", ") + "..." : "-"}
          </span>
        );
      },
    },
    {
      key: "priority",
      label: "优先级",
      render: (ch) => <span className="font-mono text-sm">{ch.priority}</span>,
    },
    {
      key: "status",
      label: "状态",
      render: (ch) => (
        <Badge variant={ch.status === 1 ? "success" : "error"}>{ch.status === 1 ? "启用" : "禁用"}</Badge>
      ),
    },
    {
      key: "actions",
      label: "操作",
      render: (ch) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEditModal(ch)}>
            编辑
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(ch.id)}>
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">渠道管理</h1>
          <p className="mt-1 text-sm text-foreground-muted">管理官方渠道</p>
        </div>
        <Button onClick={openCreateModal}>新建渠道</Button>
      </div>

      <DataTable columns={columns} data={channels} loading={loading} keyExtractor={(ch) => ch.id} />

      {/* 编辑/创建 Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingChannel ? "编辑渠道" : "新建渠道"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="渠道名称"
            placeholder="OpenAI Official"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="类型"
            type="number"
            placeholder="1"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            hint="参考 New-API 渠道类型"
          />
          <Input
            label="API Key"
            placeholder="sk-..."
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          />
          <Input
            label="Base URL"
            placeholder="https://api.openai.com"
            value={formData.base_url}
            onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
          />
          <div>
            <label className="text-sm font-medium text-foreground">支持的模型（逗号分隔）</label>
            <textarea
              value={formData.models}
              onChange={(e) => setFormData({ ...formData, models: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
              placeholder="gpt-4,gpt-3.5-turbo,..."
            />
          </div>
          <Input
            label="优先级"
            type="number"
            placeholder="0"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            hint="数值越大优先级越高"
          />
          <div>
            <label className="text-sm font-medium text-foreground">状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value={1}>启用</option>
              <option value={2}>禁用</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingChannel ? "保存" : "创建"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
