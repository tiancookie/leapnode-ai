"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { authService } from "@/lib/services";
import { useUserStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
  email?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [ref, setRef] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  // 从 URL 读取邀请码（?ref=xxx），避免 useSearchParams 的 Suspense 要求
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    if (refParam) setRef(refParam);
  }, []);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!USERNAME_PATTERN.test(username.trim())) {
      next.username = "用户名为 3-20 位字母、数字或下划线";
    }
    if (password.length < 8 || password.length > 20) {
      next.password = "密码长度为 8-20 位";
    }
    if (confirmPassword !== password) {
      next.confirmPassword = "两次输入的密码不一致";
    }
    if (email && !EMAIL_PATTERN.test(email.trim())) {
      next.email = "邮箱格式不正确";
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
      const res = await authService.register({
        username: username.trim(),
        password,
        email: email.trim() || undefined,
        ref: ref.trim() || undefined,
      });
      if (res.success) {
        // 后端返回用户信息则直接登录态进入控制台，否则引导登录
        if (res.data?.id) {
          setUser(res.data);
          router.push("/console");
        } else {
          router.push("/login");
        }
      } else {
        setSubmitError(res.message || "注册失败，请稍后重试");
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
          <h1 className="text-2xl font-bold text-foreground">注册 LeapNode</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            创建账号，一键连接全球大模型
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="用户名"
            placeholder="3-20 位字母、数字或下划线"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            autoComplete="username"
          />
          <Input
            label="密码"
            type="password"
            placeholder="8-20 位密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />
          <Input
            label="确认密码"
            type="password"
            placeholder="再次输入密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <Input
            label="邮箱"
            type="email"
            placeholder="选填，用于接收通知"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="邀请码"
            placeholder="选填"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />

          {submitError && (
            <p className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {submitError}
            </p>
          )}

          <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
            注册
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground-muted">
          已有账号？{" "}
          <Link href="/login" className="text-primary hover:text-primary-hover">
            立即登录
          </Link>
        </p>
      </Card>
    </div>
  );
}
