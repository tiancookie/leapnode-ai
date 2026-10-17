"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authService } from "@/lib/services";
import { useUserStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!username.trim()) {
      next.username = "请输入用户名";
    }
    if (!password) {
      next.password = "请输入密码";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authService.login(username.trim(), password);
      if (res.success && res.data) {
        setUser(res.data);
        router.push("/console");
      } else {
        setSubmitError(res.message || "登录失败，请检查用户名和密码");
      }
    } catch {
      setSubmitError("网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="card w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-heading-2 mb-3">登录 LeapNode</h1>
          <p className="text-body">欢迎回来，继续你的 AI 之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <Input
            label="用户名"
            placeholder="请输入用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            autoComplete="username"
          />
          <Input
            label="密码"
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />

          {submitError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{submitError}</p>
            </div>
          )}

          <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
            登录
          </Button>
        </form>

        <div className="divider" />

        <p className="text-center text-small">
          还没有账号？{" "}
          <Link href="/register" className="text-[var(--color-brand)] hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
