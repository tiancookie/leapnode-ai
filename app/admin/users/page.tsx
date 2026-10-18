"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { User, USER_LEVEL_LABELS, USER_ROLE_LABELS } from "@/lib/types";
import { quotaToDollars, formatTimestamp } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [quotaAmount, setQuotaAmount] = useState("");
  const [quotaLoading, setQuotaLoading] = useState(false);

  const PAGE_SIZE = 20;

  useEffect(() => {
    loadUsers();
  }, [page]);

  async function loadUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(PAGE_SIZE),
        keyword: keyword || "",
      });
      const res = await api.get<{ users: User[]; total: number }>(`/api/admin/users?${params}`);

      if (res.success) {
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("加载用户失败", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(kw: string) {
    setKeyword(kw);
    setPage(1);
    loadUsers();
  }

  function openQuotaModal(user: User) {
    setSelectedUser(user);
    setQuotaAmount("");
    setQuotaModalOpen(true);
  }

  async function handleQuotaAdjust() {
    if (!selectedUser || !quotaAmount) return;

    const dollars = parseFloat(quotaAmount);
    if (isNaN(dollars)) {
      alert("请输入有效的金额");
      return;
    }

    const quotaDelta = Math.round(dollars * 500000);

    setQuotaLoading(true);
    try {
      const res = await api.post(`/api/admin/users/${selectedUser.id}/quota`, {
        amount: quotaDelta,
      });

      if (res.success) {
        alert("余额调整成功");
        setQuotaModalOpen(false);
        loadUsers();
      } else {
        alert(res.message || "调整失败");
      }
    } catch (err: any) {
      alert(err.message || "调整失败");
    } finally {
      setQuotaLoading(false);
    }
  }

  const columns: Column<User>[] = [
    {
      key: "id",
      label: "ID",
      width: "w-16",
    },
    {
      key: "username",
      label: "用户名",
      render: (user) => (
        <Link
          href={`/admin/users/${user.id}`}
          className="font-medium text-primary hover:underline"
        >
          {user.username}
        </Link>
      ),
    },
    {
      key: "email",
      label: "邮箱",
    },
    {
      key: "user_level",
      label: "等级",
      render: (user) => (
        <Badge variant={user.user_level >= 2 ? "success" : "neutral"}>
          {USER_LEVEL_LABELS[user.user_level] || user.user_level}
        </Badge>
      ),
    },
    {
      key: "role",
      label: "角色",
      render: (user) => (
        <Badge variant={user.role >= 100 ? "warning" : "neutral"}>
          {USER_ROLE_LABELS[user.role] || user.role}
        </Badge>
      ),
    },
    {
      key: "quota",
      label: "余额",
      render: (user) => (
        <span className="font-mono text-primary">{quotaToDollars(user.quota)}</span>
      ),
    },
    {
      key: "created_time",
      label: "注册时间",
      render: (user) => (
        <span className="text-xs text-foreground-muted">{formatTimestamp(user.created_time)}</span>
      ),
    },
    {
      key: "actions",
      label: "操作",
      render: (user) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openQuotaModal(user)}>
            充值
          </Button>
          <Link href={`/admin/users/${user.id}`}>
            <Button size="sm" variant="ghost">
              详情
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-1">用户管理</h1>
        <p className="mt-1 text-sm text-foreground-muted">查看和管理平台用户</p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        keyExtractor={(user) => user.id}
        onSearch={handleSearch}
        searchPlaceholder="搜索用户名/邮箱"
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total,
          onPageChange: setPage,
        }}
      />

      {/* 充值 Modal */}
      <Modal
        open={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        title={`调整余额 - ${selectedUser?.username}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-foreground-muted">
            当前余额：<span className="font-mono text-primary">{selectedUser && quotaToDollars(selectedUser.quota)}</span>
          </p>
          <Input
            label="充值金额（美元）"
            type="number"
            step="0.01"
            placeholder="输入正数充值，负数扣款"
            value={quotaAmount}
            onChange={(e) => setQuotaAmount(e.target.value)}
            hint="例如：10.00 = +$10.00，-5.00 = -$5.00"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setQuotaModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleQuotaAdjust} loading={quotaLoading}>
              确认调整
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
