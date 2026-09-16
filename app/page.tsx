"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// TODO: 接 siteService.getInfo 接口获取真实统计数据
const STATS = [
  { label: "接入模型", value: "200+" },
  { label: "入驻商家", value: "50+" },
  { label: "API 调用次数", value: "1.2 亿+" },
];

// 服务商图标墙（首字母占位图标）
const PROVIDERS = [
  { name: "OpenAI", short: "O", color: "#10a37f" },
  { name: "Anthropic", short: "A", color: "#d97757" },
  { name: "Google", short: "G", color: "#4285f4" },
  { name: "阿里通义", short: "通", color: "#ff6a00" },
  { name: "百度文心", short: "文", color: "#2932e1" },
  { name: "DeepSeek", short: "D", color: "#4d6bfe" },
  { name: "Meta", short: "M", color: "#0668e1" },
  { name: "Mistral", short: "M", color: "#f54e42" },
  { name: "智谱 AI", short: "智", color: "#3859ff" },
  { name: "Moonshot", short: "K", color: "#16191e" },
  { name: "xAI", short: "X", color: "#8e8e93" },
  { name: "腾讯混元", short: "混", color: "#0052d9" },
];

const FEATURES = [
  {
    title: "统一 API 接口",
    description: "一个密钥调用全球主流大模型，兼容 OpenAI 协议，无缝切换。",
  },
  {
    title: "灵活选择渠道",
    description: "官方直连、认证商家多渠道任选，价格透明，按需组合。",
  },
  {
    title: "实时用量监控",
    description: "控制台实时查看调用记录、消费明细与余额变动，一目了然。",
  },
];

export default function HomePage() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const loggedIn = mounted && isAuthenticated;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(0, 212, 170, 0.15), transparent)",
          }}
        />
        <div className="mx-auto flex max-w-container flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            API, <span className="text-primary">连接全球模型</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-foreground-muted sm:text-lg">
            汇聚 OpenAI、Anthropic、Google 等全球主流大模型，统一 API 接口、灵活定价、
            官方直连与认证商家多渠道任选，一站式接入你的 AI 应用。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {loggedIn ? (
              <>
                <Link href="/console">
                  <Button size="lg">进入控制台</Button>
                </Link>
                <Link href="/models">
                  <Button variant="secondary" size="lg">
                    浏览模型市场
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg">免费注册</Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="lg">
                    登录
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 统计卡片 */}
      <section className="mx-auto w-full max-w-container px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <Card key={stat.label} className="flex flex-col items-center gap-1 py-8">
              <span className="text-3xl font-bold text-primary">{stat.value}</span>
              <span className="text-sm text-foreground-muted">{stat.label}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* 服务商图标墙 */}
      <section className="mx-auto w-full max-w-container px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-foreground">支持的服务商</h2>
        <p className="mt-2 text-center text-sm text-foreground-muted">
          全球主流大模型服务商一站接入
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {PROVIDERS.map((provider) => (
            <div
              key={provider.name}
              className="flex flex-col items-center gap-3 rounded-lg border border-border bg-background-card p-5 transition-colors hover:border-primary/50 hover:bg-background-hover"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-md text-base font-bold text-white"
                style={{ backgroundColor: provider.color }}
              >
                {provider.short}
              </span>
              <span className="text-sm text-foreground-muted">{provider.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 平台特性 */}
      <section className="mx-auto w-full max-w-container px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
