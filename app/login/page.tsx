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
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">登录 LeapNode</h1>
          <p className="mt-2 text-sm text-foreground-muted">欢迎回来，继续你的 AI 之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
            <p className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {submitError}
            </p>
          )}

          <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
            登录
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground-muted">
          还没有账号？{" "}
          <Link href="/register" className="text-primary hover:text-primary-hover">
            立即注册
          </Link>
        </p>
      </Card>
    </div>
  );
}
