"use client";

import { useEffect, useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { RedeemCode, REDEEM_CODE_STATUS_LABELS } from "@/lib/types";
import { quotaToDollars, formatTimestamp, copyToClipboard } from "@/lib/utils";

export default function RedeemCodesPage() {
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    amount: "",
    count: "1",
    expire_days: "30",
    merchant_id: "0",
  });

  const PAGE_SIZE = 20;

  useEffect(() => {
    loadCodes();
  }, [page]);

  async function loadCodes() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(PAGE_SIZE),
      });
      const res = await api.get<{ codes: RedeemCode[]; total: number }>(
        `/api/admin/redeem-codes?${params}`
      );

      if (res.success) {
        setCodes(res.data.codes || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("加载兑换码失败", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    const dollars = parseFloat(formData.amount);
    const count = parseInt(formData.count);
    const expireDays = parseInt(formData.expire_days);

    if (isNaN(dollars) || dollars <= 0) {
      alert("请输入有效的金额");
      return;
    }
    if (isNaN(count) || count <= 0 || count > 1000) {
      alert("生成数量必须在 1-1000 之间");
      return;
    }

    const amount = Math.round(dollars * 500000);
    const expireTime = Math.floor(Date.now() / 1000) + expireDays * 86400;

    setGenerating(true);
    try {
      const res = await api.post<{ codes: string[] }>("/api/admin/redeem-codes/generate", {
        amount,
        count,
        expire_time: expireTime,
        merchant_id: parseInt(formData.merchant_id),
      });

      if (res.success) {
        setGeneratedCodes(res.data.codes || []);
        alert(`成功生成 ${res.data.codes?.length || 0} 个兑换码`);
        loadCodes();
      } else {
        alert(res.message || "生成失败");
      }
    } catch (err: any) {
      alert(err.message || "生成失败");
    } finally {
      setGenerating(false);
    }
  }

  async function handleVoid(id: number) {
    if (!confirm("确认作废该兑换码？")) return;

    try {
      const res = await api.delete(`/api/admin/redeem-codes/${id}`);
      if (res.success) {
        alert("作废成功");
        loadCodes();
      } else {
        alert(res.message || "作废失败");
      }
    } catch (err: any) {
      alert(err.message || "作废失败");
    }
  }

  function handleCopy(code: string) {
    copyToClipboard(code).then((success) => {
      if (success) alert("已复制");
    });
  }

  const columns: Column<RedeemCode>[] = [
    {
      key: "id",
      label: "ID",
      width: "w-16",
    },
    {
      key: "code",
      label: "兑换码",
      render: (code) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-primary">{code.code}</span>
          <button
            onClick={() => handleCopy(code.code)}
            className="rounded p-1 hover:bg-background-hover"
            title="复制"
          >
            📋
          </button>
        </div>
      ),
    },
    {
      key: "amount",
      label: "金额",
      render: (code) => <span className="font-medium text-foreground">{quotaToDollars(code.amount)}</span>,
    },
    {
      key: "status",
      label: "状态",
      render: (code) => {
        const variants: Record<number, "warning" | "success" | "error"> = {
          0: "warning",
          1: "success",
          2: "error",
        };
        return (
          <Badge variant={variants[code.status] || "neutral"}>
            {REDEEM_CODE_STATUS_LABELS[code.status] || code.status}
          </Badge>
        );
      },
    },
    {
      key: "expire_time",
      label: "过期时间",
      render: (code) => (
        <span className="text-xs text-foreground-muted">{formatTimestamp(code.expire_time)}</span>
      ),
    },
    {
      key: "used_by_user_id",
      label: "使用者",
      render: (code) => code.used_by_user_id || "-",
    },
    {
      key: "merchant_id",
      label: "归属",
      render: (code) => (code.merchant_id === 0 ? "官方" : `商家${code.merchant_id}`),
    },
    {
      key: "actions",
      label: "操作",
      render: (code) =>
        code.status === 0 ? (
          <Button size="sm" variant="danger" onClick={() => handleVoid(code.id)}>
            作废
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">兑换码管理</h1>
          <p className="mt-1 text-sm text-foreground-muted">生成和管理充值兑换码</p>
        </div>
        <Button onClick={() => setGenerateModalOpen(true)}>生成兑换码</Button>
      </div>

      <DataTable
        columns={columns}
        data={codes}
        loading={loading}
        keyExtractor={(code) => code.id}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total,
          onPageChange: setPage,
        }}
      />

      {/* 生成 Modal */}
      <Modal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        title="生成兑换码"
        size="md"
      >
        <div className="space-y-4">
          {generatedCodes.length === 0 ? (
            <>
              <Input
                label="充值金额（美元）"
                type="number"
                step="0.01"
                placeholder="10.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <Input
                label="生成数量"
                type="number"
                placeholder="1"
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                hint="最多1000个"
              />
              <Input
                label="有效期（天）"
                type="number"
                placeholder="30"
                value={formData.expire_days}
                onChange={(e) => setFormData({ ...formData, expire_days: e.target.value })}
              />
              <Input
                label="归属商家ID（0=官方）"
                type="number"
                placeholder="0"
                value={formData.merchant_id}
                onChange={(e) => setFormData({ ...formData, merchant_id: e.target.value })}
              />
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setGenerateModalOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleGenerate} loading={generating}>
                  生成
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-foreground-muted">
                已生成 {generatedCodes.length} 个兑换码，请妥善保存：
              </p>
              <div className="max-h-96 space-y-1 overflow-y-auto rounded-md border border-border bg-background p-3">
                {generatedCodes.map((code, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="font-mono text-sm text-primary">{code}</span>
                    <button
                      onClick={() => handleCopy(code)}
                      className="rounded p-1 hover:bg-background-hover"
                    >
                      📋
                    </button>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => {
                  const text = generatedCodes.join("\n");
                  copyToClipboard(text).then(() => alert("已复制全部"));
                }}
                className="w-full"
              >
                复制全部
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setGenerateModalOpen(false);
                  setGeneratedCodes([]);
                }}
                className="w-full"
              >
                关闭
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
