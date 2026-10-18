"use client";

import { useEffect, useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { Package } from "@/lib/types";
import { quotaToDollars } from "@/lib/utils";

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quota: "",
    duration: "30",
    quota_reset_period: "none",
    visible: true,
  });

  useEffect(() => {
    loadPackages();
  }, []);

  async function loadPackages() {
    setLoading(true);
    try {
      const res = await api.get<Package[]>("/api/admin/packages");
      if (res.success) {
        setPackages(res.data || []);
      }
    } catch (err) {
      console.error("加载套餐失败", err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingPkg(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      quota: "",
      duration: "30",
      quota_reset_period: "none",
      visible: true,
    });
    setModalOpen(true);
  }

  function openEditModal(pkg: Package) {
    setEditingPkg(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: String(pkg.price),
      quota: String(pkg.quota),
      duration: String(pkg.duration),
      quota_reset_period: pkg.quota_reset_period,
      visible: pkg.visible,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.price || !formData.quota) {
      alert("请填写必填字段");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseInt(formData.price),
      quota: parseInt(formData.quota),
      duration: parseInt(formData.duration),
      quota_reset_period: formData.quota_reset_period,
      visible: formData.visible,
    };

    setSaving(true);
    try {
      const res = editingPkg
        ? await api.put(`/api/admin/packages/${editingPkg.id}`, payload)
        : await api.post("/api/admin/packages", payload);

      if (res.success) {
        alert(editingPkg ? "保存成功" : "创建成功");
        setModalOpen(false);
        loadPackages();
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
    if (!confirm("确认删除该套餐？如有订阅将无法删除。")) return;

    try {
      const res = await api.delete(`/api/admin/packages/${id}`);
      if (res.success) {
        alert("删除成功");
        loadPackages();
      } else {
        alert(res.message || "删除失败");
      }
    } catch (err: any) {
      alert(err.message || "删除失败");
    }
  }

  const columns: Column<Package>[] = [
    {
      key: "id",
      label: "ID",
      width: "w-16",
    },
    {
      key: "name",
      label: "套餐名称",
      render: (pkg) => <span className="font-medium text-foreground">{pkg.name}</span>,
    },
    {
      key: "description",
      label: "描述",
      render: (pkg) => <span className="text-sm text-foreground-muted">{pkg.description || "-"}</span>,
    },
    {
      key: "price",
      label: "价格",
      render: (pkg) => <span className="font-medium text-primary">{quotaToDollars(pkg.price)}</span>,
    },
    {
      key: "quota",
      label: "包含余额",
      render: (pkg) => <span className="font-mono text-sm">{quotaToDollars(pkg.quota)}</span>,
    },
    {
      key: "duration",
      label: "有效期",
      render: (pkg) => `${pkg.duration} 天`,
    },
    {
      key: "quota_reset_period",
      label: "重置周期",
      render: (pkg) => {
        const labels: Record<string, string> = {
          none: "不重置",
          daily: "每日",
          monthly: "每月",
        };
        return labels[pkg.quota_reset_period] || pkg.quota_reset_period;
      },
    },
    {
      key: "visible",
      label: "可见性",
      render: (pkg) => <Badge variant={pkg.visible ? "success" : "neutral"}>{pkg.visible ? "可见" : "隐藏"}</Badge>,
    },
    {
      key: "actions",
      label: "操作",
      render: (pkg) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEditModal(pkg)}>
            编辑
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(pkg.id)}>
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
          <h1 className="text-heading-1">套餐管理</h1>
          <p className="mt-1 text-sm text-foreground-muted">管理官方套餐</p>
        </div>
        <Button onClick={openCreateModal}>新建套餐</Button>
      </div>

      <DataTable columns={columns} data={packages} loading={loading} keyExtractor={(pkg) => pkg.id} />

      {/* 编辑/创建 Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPkg ? "编辑套餐" : "新建套餐"}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="套餐名称"
            placeholder="VIP 套餐"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div>
            <label className="text-sm font-medium text-foreground">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
              placeholder="套餐描述..."
            />
          </div>
          <Input
            label="价格（Quota）"
            type="number"
            placeholder="5000000"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            hint={`约 ${quotaToDollars(parseInt(formData.price) || 0)}`}
          />
          <Input
            label="包含余额（Quota）"
            type="number"
            placeholder="5000000"
            value={formData.quota}
            onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
            hint={`约 ${quotaToDollars(parseInt(formData.quota) || 0)}`}
          />
          <Input
            label="有效期（天）"
            type="number"
            placeholder="30"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />
          <div>
            <label className="text-sm font-medium text-foreground">重置周期</label>
            <select
              value={formData.quota_reset_period}
              onChange={(e) => setFormData({ ...formData, quota_reset_period: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="none">不重置</option>
              <option value="daily">每日重置</option>
              <option value="monthly">每月重置</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="visible"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="visible" className="text-sm text-foreground">
              对用户可见
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingPkg ? "保存" : "创建"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
