"use client";

import { FormEvent, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { authService } from "@/lib/services";
import { useUserStore } from "@/lib/store";
import { formatTimestamp, copyToClipboard } from "@/lib/utils";
import type { User } from "@/lib/types";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const USER_LEVEL_LABELS: Record<number, string> = {
  0: "普通用户",
  2: "商家",
  3: "分站主",
};

function SettingsContent() {
  const storeUser = useUserStore((s) => s.user);
  const { data: self } = useSWR<User>("/api/dist/user/self", fetcher);
  const user = self ?? storeUser;

  const [copied, setCopied] = useState(false);

  async function handleCopyAffCode() {
    if (!user?.aff_code) return;
    const inviteUrl = `${window.location.origin}/register?ref=${user.aff_code}`;
    if (await copyToClipboard(inviteUrl)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // 修改密码
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdErrors, setPwdErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPwdMsg(null);

    const errors: typeof pwdErrors = {};
    if (!oldPassword) errors.oldPassword = "请输入当前密码";
    if (newPassword.length < 8 || newPassword.length > 20) {
      errors.newPassword = "新密码长度为 8-20 位";
    }
    if (confirmPassword !== newPassword) {
      errors.confirmPassword = "两次输入的密码不一致";
    }
    setPwdErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const res = await authService.updatePassword(oldPassword, newPassword);
      if (res.success) {
        setPwdMsg({ ok: true, text: "密码修改成功" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwdMsg({ ok: false, text: res.message || "修改失败，请检查当前密码" });
      }
    } catch {
      setPwdMsg({ ok: false, text: "网络异常，请稍后重试" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-heading-1">个人设置</h1>
        <p className="text-body mt-3">管理账号信息与安全设置</p>
      </div>

      {/* 基本信息 */}
      <div className="card">
        <h2 className="text-heading-3 mb-6">基本信息</h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-foreground-muted">用户名</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {user?.username || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-foreground-muted">显示名称</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {user?.display_name || user?.username || "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-foreground-muted">邮箱</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {user?.email || "未绑定"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-foreground-muted">账号类型</dt>
            <dd className="mt-1">
              <Badge variant="primary">
                {USER_LEVEL_LABELS[user?.user_level ?? 0] || "普通用户"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-foreground-muted">注册时间</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {user ? formatTimestamp(user.created_time) : "--"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-foreground-muted">邀请码</dt>
            <dd className="mt-1 flex items-center gap-2">
              <span className="font-mono text-sm font-medium text-foreground">
                {user?.aff_code || "--"}
              </span>
              {user?.aff_code && (
                <button
                  onClick={handleCopyAffCode}
                  className="text-xs text-primary hover:text-primary-hover"
                >
                  {copied ? "已复制" : "复制邀请链接"}
                </button>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* 修改密码 */}
      <div className="card mt-8">
        <h2 className="text-heading-3 mb-2">修改密码</h2>
        <p className="text-small mb-6">修改后请使用新密码重新登录</p>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-5" noValidate>
          <Input
            label="当前密码"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            error={pwdErrors.oldPassword}
            autoComplete="current-password"
          />
          <Input
            label="新密码"
            type="password"
            placeholder="8-20 位密码"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={pwdErrors.newPassword}
            autoComplete="new-password"
          />
          <Input
            label="确认新密码"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={pwdErrors.confirmPassword}
            autoComplete="new-password"
          />
          {pwdMsg && (
            <div className={`rounded-lg px-4 py-3 ${pwdMsg.ok ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              <p className={`text-sm ${pwdMsg.ok ? "text-green-400" : "text-red-400"}`}>
                {pwdMsg.text}
              </p>
            </div>
          )}
          <Button type="submit" loading={saving} className="self-start">
            保存修改
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
