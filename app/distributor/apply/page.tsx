"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function DistributorApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    site_name: "",
    site_domain: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    target_market: "",
    marketing_channels: "",
    expected_users: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/api/distributor/apply", formData);
      alert("申请提交成功！我们会在 1-3 个工作日内审核，请留意通知。");
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "提交失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-heading-1 mb-3">申请成为分站</h1>
        <p className="text-body">
          开设您的 AI API 分销站点，自主选品定价，发展用户，赚取分销收益。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* 站点信息 */}
        <div className="mb-8">
          <h3 className="text-heading-3 mb-4">站点信息</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              站点名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="site_name"
              value={formData.site_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
              placeholder="例：AI 云平台"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              站点域名（可选）
            </label>
            <input
              type="text"
              name="site_domain"
              value={formData.site_domain}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
              placeholder="例：api.example.com（可后续配置）"
            />
            <p className="text-tiny mt-1">审核通过后可配置独立域名</p>
          </div>
        </div>

        {/* 联系方式 */}
        <div className="mb-8">
          <h3 className="text-heading-3 mb-4">联系方式</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                联系人 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
                placeholder="张三"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                联系电话 <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
                placeholder="13800138000"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              联系邮箱 <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
              placeholder="distributor@example.com"
            />
          </div>
        </div>

        {/* 业务信息 */}
        <div className="mb-8">
          <h3 className="text-heading-3 mb-4">业务信息</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              目标市场 <span className="text-red-400">*</span>
            </label>
            <select
              name="target_market"
              value={formData.target_market}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
            >
              <option value="">请选择</option>
              <option value="企业客户">企业客户</option>
              <option value="开发者">开发者</option>
              <option value="个人用户">个人用户</option>
              <option value="教育机构">教育机构</option>
              <option value="综合市场">综合市场</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              营销渠道 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="marketing_channels"
              value={formData.marketing_channels}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
              placeholder="例：微信公众号、技术社区、线下活动等"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              预计用户规模 <span className="text-red-400">*</span>
            </label>
            <select
              name="expected_users"
              value={formData.expected_users}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
            >
              <option value="">请选择</option>
              <option value="100以下">100 人以下</option>
              <option value="100-500">100 - 500 人</option>
              <option value="500-1000">500 - 1000 人</option>
              <option value="1000-5000">1000 - 5000 人</option>
              <option value="5000以上">5000 人以上</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              申请理由 <span className="text-red-400">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
              placeholder="请说明您的运营经验、用户资源、以及为什么选择成为我们的分站..."
            />
            <p className="text-tiny mt-1">至少 30 字</p>
          </div>
        </div>

        <div className="divider" />

        {/* 提交按钮 */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-secondary hover:text-primary">
            ← 返回首页
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "提交中..." : "提交申请"}
          </button>
        </div>
      </form>

      {/* 提示信息 */}
      <div className="mt-8 card-compact">
        <h4 className="text-lg font-medium mb-3">🎯 分站权益</h4>
        <ul className="text-sm text-secondary space-y-2">
          <li>• 独立站点：可配置独立域名和品牌</li>
          <li>• 自主选品：从官方渠道和商家池选择模型</li>
          <li>• 灵活定价：在成本价基础上自主加价</li>
          <li>• 用户管理：管理您的用户和订单</li>
          <li>• 收益透明：实时查看分销收益</li>
          <li>• 审核周期：1-3 个工作日</li>
        </ul>
      </div>
    </div>
  );
}
