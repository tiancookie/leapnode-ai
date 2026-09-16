import Link from "next/link";

const FOOTER_LINKS = [
  { label: "模型市场", href: "/models" },
  { label: "商家目录", href: "/merchants" },
  { label: "官方渠道", href: "/channels" },
  { label: "控制台", href: "/console" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-xs font-bold text-white">
            L
          </span>
          <span className="text-sm text-foreground-muted">
            © {new Date().getFullYear()} LeapNode · AI API 聚合平台
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-4">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
