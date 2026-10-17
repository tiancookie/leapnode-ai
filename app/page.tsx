"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";

const STATS = [
  { label: "接入模型", value: "200+" },
  { label: "入驻商家", value: "50+" },
  { label: "API 调用次数", value: "1.2 亿+" },
];

const PROVIDERS = [
  { name: "OpenAI", short: "O", color: "#10a37f" },
  { name: "Anthropic", short: "A", color: "#d97757" },
  { name: "Google", short: "G", color: "#4285f4" },
  { name: "阿里通义", short: "通", color: "#ff6a00" },
  { name: "百度文心", short: "文", color: "#2932e1" },
  { name: "DeepSeek", short: "D", color: "#4d6bfe" },
  { name: "智谱 AI", short: "智", color: "#3859ff" },
  { name: "月之暗面", short: "月", color: "#6366f1" },
];

const FEATURES = [
  {
    title: "🌍 全球模型聚合",
    description: "一个 API 接入 200+ 大模型，无需单独对接各家服务商。",
  },
  {
    title: "💰 透明定价",
    description: "实时显示各模型成本价，商家自主定价，分站二次加价。",
  },
  {
    title: "🚀 高可用架构",
    description: "多渠道负载均衡，自动故障切换，保证 99.9% 可用性。",
  },
];

export default function HomePage() {
  const user = useUserStore((s) => s.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(0, 212, 170, 0.15), transparent)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 text-center sm:px-6">
          <h1 className="text-heading-1 mb-6">
            AI API 聚合平台，<span className="text-[var(--color-brand)]">连接全球模型</span>
          </h1>
          <p className="text-body mx-auto mb-10 max-w-2xl">
            汇聚全球主流大模型，统一 API 接口，透明定价，按需调用。
            支持 OpenAI、Anthropic、Google、国产大模型等 200+ 模型。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {user ? (
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
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 mb-20">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="card text-center py-8">
              <span className="text-4xl font-bold text-[var(--color-brand)] mb-2 block">
                {stat.value}
              </span>
              <span className="text-body">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 服务商图标墙 */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-heading-2 text-center mb-3">支持的服务商</h2>
        <p className="text-body text-center mb-10">
          全球主流大模型服务商一站接入
        </p>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {PROVIDERS.map((provider) => (
            <div
              key={provider.name}
              className="card flex flex-col items-center gap-3"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-white"
                style={{ backgroundColor: provider.color }}
              >
                {provider.short}
              </span>
              <span className="text-small">{provider.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 平台特性 */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card">
              <h3 className="text-heading-3 mb-3">{feature.title}</h3>
              <p className="text-body">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
