"use client";

import { FormEvent, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/api";
import { topupService } from "@/lib/services";
import { useUserStore } from "@/lib/store";
import { quotaToDollars, quotaToCNY } from "@/lib/utils";
import type { PaginatedResponse, TopupRecord, User } from "@/lib/types";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

function WalletContent() {
  const { mutate } = useSWRConfig();
  const storeUser = useUserStore((s) => s.user);
  const updateQuota = useUserStore((s) => s.updateQuota);

  const { data: self } = useSWR<User>("/api/dist/user/self", fetcher);
  const user = self ?? storeUser;

  const { data: history } = useSWR<PaginatedResponse<TopupRecord>>(
    "/api/dist/topup/history?page=1&page_size=20",
    fetcher
  );
  const records = history?.records ?? [];

  // 兑换码
  const [code, setCode] = useState("");
  const [redeemMsg, setRedeemMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  async function handleRedeem(e: FormEvent) {
    e.preventDefault();
    setRedeemMsg(null);
    if (!code.trim()) {
      setRedeemMsg({ ok: false, text: "请输入兑换码" });
      return;
    }
    setRedeeming(true);
    try {
      const res = await topupService.redeem(code.trim());
      if (res.success) {
        setRedeemMsg({ ok: true, text: "兑换成功，余额已到账" });
        setCode("");
        // 刷新余额与充值记录
        const refreshed = await mutate("/api/dist/user/self");
        if (refreshed && typeof (refreshed as User).quota === "number") {
          updateQuota((refreshed as User).quota);
        }
        mutate("/api/dist/topup/history?page=1&page_size=20");
      } else {
        setRedeemMsg({ ok: false, text: res.message || "兑换失败，请检查兑换码" });
      }
    } catch {
      setRedeemMsg({ ok: false, text: "网络异常，请稍后重试" });
    } finally {
      setRedeeming(false);
    }
  }

  // USDT 充值
  const [usdtAmount, setUsdtAmount] = useState("");
  const [usdtMsg, setUsdtMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [paying, setPaying] = useState(false);

  async function handleCryptoPay(e: FormEvent) {
    e.preventDefault();
    setUsdtMsg(null);
    const amount = Number(usdtAmount);
    if (!amount || amount <= 0) {
      setUsdtMsg({ ok: false, text: "请输入有效的充值金额" });
      return;
    }
    setPaying(true);
    try {
      // TODO: 接 USDT 支付完整流程（展示收款地址/二维码 + 轮询 cryptoStatus）
      const res = await topupService.cryptoPay(amount);
      if (res.success) {
        setUsdtMsg({ ok: true, text: "订单已创建，请按指引完成 USDT 转账" });
        mutate("/api/dist/topup/history?page=1&page_size=20");
      } else {
        setUsdtMsg({ ok: false, text: res.message || "创建订单失败，请稍后重试" });
      }
    } catch {
      setUsdtMsg({ ok: false, text: "网络异常，请稍后重试" });
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-container px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">钱包管理</h1>
        <p className="mt-1 text-sm text-foreground-muted">查看余额、充值与充值记录</p>
      </div>

      {/* 余额 */}
      <Card className="bg-gradient-to-r from-primary/15 to-transparent">
        <p className="text-sm text-foreground-muted">当前余额</p>
        <p className="mt-2 text-4xl font-bold text-foreground">
          {user ? quotaToDollars(user.quota) : "--"}
        </p>
        <p className="mt-1 text-sm text-foreground-muted">
          {user ? `≈ ${quotaToCNY(user.quota)}` : ""}
        </p>
      </Card>

      {/* 充值入口 */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>兑换码充值</CardTitle>
            <CardDescription>输入兑换码，额度实时到账</CardDescription>
          </CardHeader>
          <form onSubmit={handleRedeem} className="flex flex-col gap-3">
            <Input
              placeholder="请输入兑换码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {redeemMsg && (
              <p className={`text-sm ${redeemMsg.ok ? "text-success" : "text-error"}`}>
                {redeemMsg.text}
              </p>
            )}
            <Button type="submit" loading={redeeming} className="self-start">
              兑换
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>USDT 充值</CardTitle>
            <CardDescription>TRC20 网络，1 USDT = $1.00 额度</CardDescription>
          </CardHeader>
          <form onSubmit={handleCryptoPay} className="flex flex-col gap-3">
            <Input
              type="number"
              min="1"
              step="0.01"
              placeholder="充值金额（USDT）"
              value={usdtAmount}
              onChange={(e) => setUsdtAmount(e.target.value)}
            />
            {usdtMsg && (
              <p className={`text-sm ${usdtMsg.ok ? "text-success" : "text-error"}`}>
                {usdtMsg.text}
              </p>
            )}
            <Button type="submit" loading={paying} className="self-start">
              创建订单
            </Button>
          </form>
        </Card>
      </div>

      {/* 充值记录 */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">充值记录</h2>
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-foreground-muted">
                <th className="px-4 py-3 font-medium">时间</th>
                <th className="px-4 py-3 font-medium">方式</th>
                <th className="px-4 py-3 font-medium">订单号</th>
                <th className="px-4 py-3 font-medium">金额</th>
                <th className="px-4 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-foreground-muted">
                    暂无充值记录
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border/50 last:border-0 hover:bg-background-hover"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-foreground-muted">
                      {record.created_at}
                    </td>
                    <td className="px-4 py-3 text-foreground">{record.method}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground-muted">
                      {record.order_no}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-success">
                      +{record.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={record.status === 1 ? "success" : "warning"}>
                        {record.status === 1 ? "已到账" : "处理中"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <AuthGuard>
      <WalletContent />
    </AuthGuard>
  );
}
