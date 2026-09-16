import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

/** 预留功能占位页（P2） */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
        <svg
          className="h-8 w-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.42 15.17L17.25 21A2.65 2.65 0 1021 17.25l-5.83-5.83M11.42 15.17L5.6 21M11.42 15.17l4.66-4.66M3 3l3.6 3.6m0 0A5.98 5.98 0 019 5.5c1.02 0 1.98.26 2.82.71l2.26-2.26a8 8 0 00-9.9 9.9l2.26-2.26A5.97 5.97 0 016.6 6.6z"
          />
        </svg>
      </span>
      <h1 className="mt-6 text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground-muted">{description}</p>
      <p className="mt-1 text-sm text-foreground-disabled">功能开发中，敬请期待</p>
      <div className="mt-8 flex gap-3">
        <Link href="/models">
          <Button variant="secondary">浏览模型市场</Button>
        </Link>
        <Link href="/">
          <Button variant="ghost">返回首页</Button>
        </Link>
      </div>
    </div>
  );
}
