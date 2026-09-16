/**
 * 工具函数
 */

// Quota 换算：Q = 500,000 = $1.00
const QUOTA_PER_DOLLAR = 500000;

/** quota → 美元字符串 */
export function quotaToDollars(quota: number): string {
  return `$${(quota / QUOTA_PER_DOLLAR).toFixed(2)}`;
}

/** quota → 人民币字符串（汇率 7.14） */
export function quotaToCNY(quota: number): string {
  const usd = quota / QUOTA_PER_DOLLAR;
  return `¥${(usd * 7.14).toFixed(2)}`;
}

/** 美元 → quota */
export function dollarsToQuota(dollars: number): number {
  return Math.round(dollars * QUOTA_PER_DOLLAR);
}

/** Unix 秒 → 格式化日期 */
export function formatTimestamp(unix: number): string {
  if (!unix || unix < 0) return "永不过期";
  const date = new Date(unix * 1000);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 数字千分位格式化 */
export function formatNumber(num: number): string {
  return num.toLocaleString("zh-CN");
}

/** 大数字缩写（1.2k, 3.4M） */
export function abbreviateNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}k`;
  return String(num);
}

/** className 合并（简易版 clsx） */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** 复制到剪贴板 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
