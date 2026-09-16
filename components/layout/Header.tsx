"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUserStore, useUIStore } from "@/lib/store";
import { authService } from "@/lib/services";
import { quotaToDollars, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

// 主导航菜单
const NAV_ITEMS = [
  { label: "模型", href: "/models" },
  { label: "商家", href: "/merchants" },
  { label: "官方渠道", href: "/channels" },
  { label: "订阅共享", href: "/subscriptions" },
];

// 探索下拉菜单
const EXPLORE_ITEMS = [
  { label: "技能广场", href: "/explore/skills" },
  { label: "应用中心", href: "/explore/apps" },
  { label: "排行榜", href: "/explore/leaderboard" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, clearUser } = useUserStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  // 等待 Zustand persist 水合，避免 SSR/客户端渲染不一致
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [exploreOpen, setExploreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 路由变化时关闭移动端菜单和下拉
  useEffect(() => {
    setSidebarOpen(false);
    setExploreOpen(false);
    setUserMenuOpen(false);
  }, [pathname, setSidebarOpen]);

  async function handleLogout() {
    try {
      await authService.logout();
    } finally {
      clearUser();
      setUserMenuOpen(false);
      router.push("/");
    }
  }

  const loggedIn = mounted && isAuthenticated && user;

  // 用户下拉菜单项（经营站后台/商家中心按 user_level 显示）
  const userMenuItems: { label: string; href: string; todo?: boolean }[] = [
    { label: "钱包管理", href: "/wallet" },
    // TODO: 接令牌管理页面（/console/tokens），后端 tokenService 已就绪
    { label: "令牌", href: "/console" },
    { label: "控制台", href: "/console" },
    ...(user?.user_level === 3
      ? // TODO: 接经营站后台地址
        [{ label: "经营站后台", href: "#", todo: true }]
      : []),
    ...(user?.user_level === 2
      ? // TODO: 接商家中心地址
        [{ label: "商家中心", href: "#", todo: true }]
      : []),
    { label: "个人设置", href: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 sm:px-6">
        {/* 左：Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-base font-bold text-white">
              L
            </span>
            <span className="text-lg font-bold text-foreground">
              Leap<span className="text-primary">Node</span>
            </span>
          </Link>

          {/* 中：桌面端导航 */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "text-primary"
                    : "text-foreground-muted hover:bg-background-hover hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* 探索下拉 */}
            <div className="relative" ref={exploreRef}>
              <button
                onClick={() => setExploreOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors",
                  pathname.startsWith("/explore")
                    ? "text-primary"
                    : "text-foreground-muted hover:bg-background-hover hover:text-foreground"
                )}
              >
                探索
                <svg
                  className={cn("h-3.5 w-3.5 transition-transform", exploreOpen && "rotate-180")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {exploreOpen && (
                <div className="absolute left-0 top-full mt-1 w-40 rounded-md border border-border bg-background-card py-1 shadow-card">
                  {EXPLORE_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-foreground-muted hover:bg-background-hover hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/console"
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors",
                pathname === "/console"
                  ? "text-primary"
                  : "text-foreground-muted hover:bg-background-hover hover:text-foreground"
              )}
            >
              控制台
            </Link>
          </nav>
        </div>

        {/* 右：用户区 */}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              {/* 通知图标 */}
              {/* TODO: 接通知接口 */}
              <button
                aria-label="通知"
                className="hidden rounded-md p-2 text-foreground-muted transition-colors hover:bg-background-hover hover:text-foreground sm:block"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.66V5a2 2 0 10-4 0v.34A6 6 0 006 11v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              {/* 余额 */}
              <Link
                href="/wallet"
                className="hidden items-center gap-1.5 rounded-full border border-border bg-background-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary sm:flex"
              >
                <span className="text-primary">$</span>
                {quotaToDollars(user.quota).slice(1)}
              </Link>

              {/* 用户头像下拉 */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label="用户菜单"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary transition-colors hover:bg-primary/30"
                >
                  {(user.display_name || user.username).charAt(0).toUpperCase()}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-background-card py-1 shadow-card">
                    <div className="border-b border-border px-4 py-2.5">
                      <p className="truncate text-sm font-medium text-foreground">
                        {user.display_name || user.username}
                      </p>
                      <p className="truncate text-xs text-foreground-muted">{user.email || "未绑定邮箱"}</p>
                    </div>
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-foreground-muted hover:bg-background-hover hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-error hover:bg-background-hover"
                    >
                      退出
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            mounted && (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    登录
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    注册
                  </Button>
                </Link>
              </div>
            )
          )}

          {/* 移动端汉堡菜单按钮 */}
          <button
            onClick={toggleSidebar}
            aria-label="打开菜单"
            className="rounded-md p-2 text-foreground-muted transition-colors hover:bg-background-hover hover:text-foreground lg:hidden"
          >
            {sidebarOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 移动端菜单 */}
      {sidebarOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="flex flex-col px-4 py-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm",
                  pathname === item.href
                    ? "text-primary"
                    : "text-foreground-muted hover:bg-background-hover hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
            {EXPLORE_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2.5 text-sm text-foreground-muted hover:bg-background-hover hover:text-foreground"
              >
                探索 · {item.label}
              </Link>
            ))}
            <Link
              href="/console"
              className={cn(
                "rounded-md px-3 py-2.5 text-sm",
                pathname === "/console"
                  ? "text-primary"
                  : "text-foreground-muted hover:bg-background-hover hover:text-foreground"
              )}
            >
              控制台
            </Link>
            {!loggedIn && mounted && (
              <div className="mt-2 flex gap-2 border-t border-border pt-3 pb-2">
                <Link href="/login" className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    登录
                  </Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">
                    注册
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
