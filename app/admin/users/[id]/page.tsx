"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { User, USER_LEVEL_LABELS, USER_ROLE_LABELS } from "@/lib/types";
import { quotaToDollars, formatTimestamp } from "@/lib/utils";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    user_level: 0,
    role: 1,
    quota: 0,
  });

  useEffect(() => {
    loadUser();
  }, [userId]);

  async function loadUser() {
    setLoading(true);
    try {
      const res = await api.get<User>(`/api/admin/users/${userId}`);
      if (res.success) {
        setUser(res.data);
        setFormData({
          user_level: res.data.user_level,
          role: res.data.role,
          quota: res.data.quota,
        });
      }
    } catch (err) {
      console.error("加载用户失败", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user) return;

    setEditing(true);
    try {
      const res = await api.put(`/api/admin/users/${userId}`, formData);
      if (res.success) {
        alert("保存成功");
        loadUser();
      } else {
        alert(res.message || "保存失败");
      }
    } catch (err: any) {
      alert(err.message || "保存失败");
    } finally {
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (!confirm("确认删除该用户？此操作不可恢复。")) return;

    try {
      const res = await api.delete(`/api/admin/users/${userId}`);
      if (res.success) {
        alert("删除成功");
        router.push("/admin/users");
      } else {
        alert(res.message || "删除失败");
      }
    } catch (err: any) {
      alert(err.message || "删除失败");
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

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-foreground-muted">用户不存在</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-1">用户详情</h1>
          <p className="mt-1 text-sm text-foreground-muted">ID: {user.id}</p>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>
          返回
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-foreground-muted">用户名</p>
              <p className="font-medium text-foreground">{user.username}</p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted">邮箱</p>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted">显示名称</p>
              <p className="font-medium text-foreground">{user.display_name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted">注册时间</p>
              <p className="font-medium text-foreground">{formatTimestamp(user.created_time)}</p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted">推广码</p>
              <p className="font-mono text-sm text-foreground">{user.aff_code || "-"}</p>
            </div>
          </CardContent>
        </Card>

        {/* 编辑权限 */}
        <Card>
          <CardHeader>
            <CardTitle>权限设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">用户等级</label>
              <select
                value={formData.user_level}
                onChange={(e) => setFormData({ ...formData, user_level: parseInt(e.target.value) })}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value={0}>普通用户</option>
                <option value={1}>VIP用户</option>
                <option value={2}>商家</option>
                <option value={3}>分站主</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">角色权限</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: parseInt(e.target.value) })}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value={1}>普通用户</option>
                <option value={10}>普通管理员</option>
                <option value={100}>超级管理员</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">余额（Quota）</label>
              <Input
                type="number"
                value={formData.quota}
                onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) })}
                hint={`约 ${quotaToDollars(formData.quota)}`}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} loading={editing} className="flex-1">
                保存修改
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                删除用户
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
