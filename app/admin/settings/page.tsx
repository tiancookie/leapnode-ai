"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

interface SystemConfig {
  referral_rate_level1: number;
  referral_rate_level2: number;
  default_package_visible: boolean;
  min_recharge_amount: number;
  max_recharge_amount: number;
  [key: string]: any;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    referral_rate_level1: "",
    referral_rate_level2: "",
    default_package_visible: true,
    min_recharge_amount: "",
    max_recharge_amount: "",
  });

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const res = await api.get<SystemConfig>("/api/admin/config");
      if (res.success) {
        setConfig(res.data);
        setFormData({
          referral_rate_level1: String(res.data.referral_rate_level1 || 0),
          referral_rate_level2: String(res.data.referral_rate_level2 || 0),
          default_package_visible: res.data.default_package_visible ?? true,
          min_recharge_amount: String(res.data.min_recharge_amount || 0),
          max_recharge_amount: String(res.data.max_recharge_amount || 0),
        });
      }
    } catch (err) {
      console.error("加载配置失败", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        referral_rate_level1: parseFloat(formData.referral_rate_level1),
        referral_rate_level2: parseFloat(formData.referral_rate_level2),
        default_package_visible: formData.default_package_visible,
        min_recharge_amount: parseInt(formData.min_recharge_amount),
        max_recharge_amount: parseInt(formData.max_recharge_amount),
      };

      const res = await api.put("/api/admin/config", payload);
      if (res.success) {
        alert("保存成功");
        loadConfig();
      } else {
        alert(res.message || "保存失败");
      }
    } catch (err: any) {
      alert(err.message || "保存失败");
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">系统配置</h1>
        <p className="mt-1 text-sm text-foreground-muted">全局系统设置</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 返佣设置 */}
        <Card>
          <CardHeader>
            <CardTitle>返佣比例</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="一级返佣比例（%）"
              type="number"
              step="0.01"
              placeholder="5.00"
              value={formData.referral_rate_level1}
              onChange={(e) => setFormData({ ...formData, referral_rate_level1: e.target.value })}
              hint="直推用户消费返佣比例"
            />
            <Input
              label="二级返佣比例（%）"
              type="number"
              step="0.01"
              placeholder="2.00"
              value={formData.referral_rate_level2}
              onChange={(e) => setFormData({ ...formData, referral_rate_level2: e.target.value })}
              hint="间接推广用户消费返佣比例"
            />
          </CardContent>
        </Card>

        {/* 充值限制 */}
        <Card>
          <CardHeader>
            <CardTitle>充值限制</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="最小充值金额（Quota）"
              type="number"
              placeholder="500000"
              value={formData.min_recharge_amount}
              onChange={(e) => setFormData({ ...formData, min_recharge_amount: e.target.value })}
              hint="500000 = $1.00"
            />
            <Input
              label="最大充值金额（Quota）"
              type="number"
              placeholder="50000000"
              value={formData.max_recharge_amount}
              onChange={(e) => setFormData({ ...formData, max_recharge_amount: e.target.value })}
              hint="50000000 = $100.00"
            />
          </CardContent>
        </Card>

        {/* 套餐设置 */}
        <Card>
          <CardHeader>
            <CardTitle>套餐默认设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="default_package_visible"
                checked={formData.default_package_visible}
                onChange={(e) =>
                  setFormData({ ...formData, default_package_visible: e.target.checked })
                }
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="default_package_visible" className="text-sm text-foreground">
                新建套餐默认可见
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 当前配置快照 */}
        <Card>
          <CardHeader>
            <CardTitle>配置快照</CardTitle>
          </CardHeader>
          <CardContent>
            {config && (
              <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 text-xs text-foreground-muted">
                {JSON.stringify(config, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">
          保存配置
        </Button>
      </div>
    </div>
  );
}
