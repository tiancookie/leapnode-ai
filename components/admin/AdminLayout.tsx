"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store";

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { label: "数据概览", href: "/admin/dashboard", icon: "📊" },
  { label: "用户管理", href: "/admin/users", icon: "👥" },
  { label: "商家审核", href: "/admin/merchants/pending", icon: "🏪" },
  { label: "分站审核", href: "/admin/distributors/pending", icon: "🌐" },
  { label: "兑换码", href: "/admin/redeem-codes", icon: "🎫" },
  { label: "套餐管理", href: "/admin/packages", icon: "📦" },
  { label: "渠道管理", href: "/admin/channels", icon: "🔌" },
  { label: "返佣管理", href: "/admin/referrals", icon: "💰" },
  { label: "系统配置", href: "/admin/settings", icon: "⚙️" },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);

  const handleLogout = () => {
    clearUser();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-background-card transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link href="/admin/dashboard" className="text-xl font-bold text-primary">
              LeapNode
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-2 hover:bg-background-hover"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* 导航 */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground-muted hover:bg-background-hover hover:text-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 底部用户信息 */}
        <div className="border-t border-border p-3">
          {!collapsed && user && (
            <div className="mb-2 rounded-md bg-background-hover p-2">
              <p className="text-xs text-foreground-muted">当前用户</p>
              <p className="text-sm font-medium text-foreground">{user.username}</p>
              <p className="text-xs text-foreground-muted">
                {user.role >= 100 ? "超级管理员" : "管理员"}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-error/10 px-3 py-2 text-sm font-medium text-error hover:bg-error/20"
          >
            {collapsed ? "🚪" : "退出登录"}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background-card px-6">
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Link href="/admin/dashboard" className="hover:text-foreground">
              总端管理
            </Link>
            {pathname !== "/admin/dashboard" && (
              <>
                <span>/</span>
                <span className="text-foreground">
                  {NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label || "页面"}
                </span>
              </>
            )}
          </div>
          <div className="text-sm text-foreground-muted">
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        {/* 页面内容 */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  );
}
