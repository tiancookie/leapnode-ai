"use client";

import { useEffect, useState } from "react";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { DistributorApplication } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";

export default function DistributorsPendingPage() {
  const [applications, setApplications] = useState<DistributorApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<DistributorApplication | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const res = await api.get<DistributorApplication[]>("/api/admin/distributors/pending");
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (err) {
      console.error("加载申请失败", err);
    } finally {
      setLoading(false);
    }
  }

  function openDetail(app: DistributorApplication) {
    setSelectedApp(app);
    setReviewNote("");
    setDetailModalOpen(true);
  }

  async function handleApprove() {
    if (!selectedApp) return;

    setReviewing(true);
    try {
      const res = await api.post(`/api/admin/distributors/${selectedApp.id}/approve`);
      if (res.success) {
        alert("审批通过，已升级为分站主");
        setDetailModalOpen(false);
        loadApplications();
      } else {
        alert(res.message || "审批失败");
      }
    } catch (err: any) {
      alert(err.message || "审批失败");
    } finally {
      setReviewing(false);
    }
  }

  async function handleReject() {
    if (!selectedApp || !reviewNote.trim()) {
      alert("请填写拒绝理由");
      return;
    }

    setReviewing(true);
    try {
      const res = await api.post(`/api/admin/distributors/${selectedApp.id}/reject`, {
        review_note: reviewNote,
      });
      if (res.success) {
        alert("已拒绝");
        setDetailModalOpen(false);
        loadApplications();
      } else {
        alert(res.message || "操作失败");
      }
    } catch (err: any) {
      alert(err.message || "操作失败");
    } finally {
      setReviewing(false);
    }
  }

  const columns: Column<DistributorApplication>[] = [
    {
      key: "id",
      label: "ID",
      width: "w-16",
    },
    {
      key: "user_id",
      label: "申请人ID",
    },
    {
      key: "business_name",
      label: "业务名称",
      render: (app) => <span className="font-medium text-foreground">{app.business_name}</span>,
    },
    {
      key: "business_type",
      label: "业务类型",
    },
    {
      key: "contact_email",
      label: "联系邮箱",
    },
    {
      key: "created_time",
      label: "申请时间",
      render: (app) => (
        <span className="text-xs text-foreground-muted">{formatTimestamp(app.created_time)}</span>
      ),
    },
    {
      key: "status",
      label: "状态",
      render: (app) => {
        const variants: Record<string, "warning" | "success" | "error"> = {
          pending: "warning",
          approved: "success",
          rejected: "error",
        };
        return <Badge variant={variants[app.status] || "neutral"}>{app.status}</Badge>;
      },
    },
    {
      key: "actions",
      label: "操作",
      render: (app) => (
        <Button size="sm" variant="secondary" onClick={() => openDetail(app)}>
          审核
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-1">分站审核</h1>
        <p className="mt-1 text-sm text-foreground-muted">待审核的分站申请</p>
      </div>

      <DataTable
        columns={columns}
        data={applications}
        loading={loading}
        keyExtractor={(app) => app.id}
        emptyText="暂无待审核申请"
      />

      {/* 审核详情 Modal */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="分站申请详情"
        size="md"
      >
        {selectedApp && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-foreground-muted">申请人ID</p>
                <p className="font-medium text-foreground">{selectedApp.user_id}</p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted">申请时间</p>
                <p className="font-medium text-foreground">
                  {formatTimestamp(selectedApp.created_time)}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted">业务名称</p>
                <p className="font-medium text-foreground">{selectedApp.business_name}</p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted">业务类型</p>
                <p className="font-medium text-foreground">{selectedApp.business_type}</p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted">联系邮箱</p>
                <p className="font-medium text-foreground">{selectedApp.contact_email}</p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted">联系电话</p>
                <p className="font-medium text-foreground">{selectedApp.contact_phone || "-"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-foreground-muted">申请理由</p>
              <p className="mt-1 rounded-md border border-border bg-background p-3 text-sm text-foreground">
                {selectedApp.reason || "-"}
              </p>
            </div>

            {selectedApp.status === "pending" && (
              <>
                <Input
                  label="拒绝理由（批准时可留空）"
                  placeholder="请填写拒绝理由..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />

                <div className="flex justify-end gap-3">
                  <Button variant="danger" onClick={handleReject} loading={reviewing}>
                    拒绝
                  </Button>
                  <Button onClick={handleApprove} loading={reviewing}>
                    批准
                  </Button>
                </div>
              </>
            )}

            {selectedApp.status !== "pending" && (
              <div className="rounded-md border border-border bg-background-hover p-3">
                <p className="text-xs text-foreground-muted">审核结果</p>
                <p className="mt-1 text-sm text-foreground">
                  {selectedApp.status === "approved" ? "已批准" : "已拒绝"}
                </p>
                {selectedApp.review_note && (
                  <>
                    <p className="mt-2 text-xs text-foreground-muted">审核备注</p>
                    <p className="mt-1 text-sm text-foreground">{selectedApp.review_note}</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
