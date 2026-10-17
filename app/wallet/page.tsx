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
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-heading-1 mb-3">钱包管理</h1>
        <p className="text-body">查看余额、充值与充值记录</p>
      </div>

      {/* 余额卡片 */}
      <div className="card mb-8" style={{
        background: "linear-gradient(to right, rgba(0, 212, 170, 0.15), transparent)"
      }}>
        <p className="text-small mb-3">当前余额</p>
        <p className="text-5xl font-bold text-[var(--color-brand)] mb-2">
          {user ? quotaToDollars(user.quota) : "--"}
        </p>
        <p className="text-body">
          {user ? `≈ ${quotaToCNY(user.quota)}` : ""}
        </p>
      </div>

      {/* 充值入口 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-10">
        <div className="card">
          <h3 className="card-title mb-2">兑换码充值</h3>
          <p className="text-small mb-5">输入兑换码，额度实时到账</p>
          <form onSubmit={handleRedeem} className="flex flex-col gap-4">
            <Input
              placeholder="请输入兑换码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {redeemMsg && (
              <div className={`rounded-lg px-4 py-3 ${
                redeemMsg.ok 
                  ? "bg-green-500/10 border border-green-500/20" 
                  : "bg-red-500/10 border border-red-500/20"
              }`}>
                <p className={`text-sm ${redeemMsg.ok ? "text-green-400" : "text-red-400"}`}>
                  {redeemMsg.text}
                </p>
              </div>
            )}
            <Button type="submit" loading={redeeming} className="self-start">
              兑换
            </Button>
          </form>
        </div>

        <div className="card">
          <h3 className="card-title mb-2">USDT 充值</h3>
          <p className="text-small mb-5">TRC20 网络，1 USDT = $1.00 额度</p>
          <form onSubmit={handleCryptoPay} className="flex flex-col gap-4">
            <Input
              type="number"
              min="1"
              step="0.01"
              placeholder="充值金额（USDT）"
              value={usdtAmount}
              onChange={(e) => setUsdtAmount(e.target.value)}
            />
            {usdtMsg && (
              <div className={`rounded-lg px-4 py-3 ${
                usdtMsg.ok 
                  ? "bg-green-500/10 border border-green-500/20" 
                  : "bg-red-500/10 border border-red-500/20"
              }`}>
                <p className={`text-sm ${usdtMsg.ok ? "text-green-400" : "text-red-400"}`}>
                  {usdtMsg.text}
                </p>
              </div>
            )}
            <Button type="submit" loading={paying} className="self-start">
              创建订单
            </Button>
          </form>
        </div>
      </div>

      {/* 充值记录 */}
      <div>
        <h2 className="text-heading-2 mb-5">充值记录</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>时间</th>
                <th>方式</th>
                <th>订单号</th>
                <th className="text-right">金额</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-secondary">
                    暂无充值记录
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id}>
                    <td className="text-sm">{record.created_at}</td>
                    <td>{record.method}</td>
                    <td className="font-mono text-xs text-secondary">{record.order_no}</td>
                    <td className="text-right font-semibold text-green-400">
                      +{record.amount.toFixed(2)}
                    </td>
                    <td>
                      <Badge variant={record.status === 1 ? "success" : "warning"}>
                        {record.status === 1 ? "已到账" : "处理中"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
