"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function MerchantApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    business_license: "",
    api_experience: "",
    expected_volume: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/api/merchant/apply", formData);
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
        <h1 className="text-heading-1 mb-3">申请成为商家</h1>
        <p className="text-body">
          上架您的 AI 模型渠道，自主定价，赚取差价收益。审核通过后即可开始运营。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* 公司信息 */}
        <div className="mb-8">
          <h3 className="text-heading-3 mb-4">公司/团队信息</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              公司/团队名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
              placeholder="请输入公司或团队名称"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              营业执照/统一社会信用代码（可选）
            </label>
            <input
              type="text"
              name="business_license"
              value={formData.business_license}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
              placeholder="有助于提升审核通过率"
            />
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
              placeholder="merchant@example.com"
            />
          </div>
        </div>

        {/* 业务信息 */}
        <div className="mb-8">
          <h3 className="text-heading-3 mb-4">业务信息</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              API 接入经验 <span className="text-red-400">*</span>
            </label>
            <select
              name="api_experience"
              value={formData.api_experience}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
            >
              <option value="">请选择</option>
              <option value="1年以下">1年以下</option>
              <option value="1-3年">1-3年</option>
              <option value="3-5年">3-5年</option>
              <option value="5年以上">5年以上</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              预计月调用量 <span className="text-red-400">*</span>
            </label>
            <select
              name="expected_volume"
              value={formData.expected_volume}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
            >
              <option value="">请选择</option>
              <option value="100万以下">100万 tokens 以下</option>
              <option value="100万-500万">100万 - 500万 tokens</option>
              <option value="500万-1000万">500万 - 1000万 tokens</option>
              <option value="1000万以上">1000万 tokens 以上</option>
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
              placeholder="请简要说明您的业务场景、拥有的模型资源、以及选择我们平台的原因..."
            />
            <p className="text-tiny mt-1">至少 20 字</p>
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
        <h4 className="text-lg font-medium mb-3">📋 审核说明</h4>
        <ul className="text-sm text-secondary space-y-2">
          <li>• 审核周期：1-3 个工作日</li>
          <li>• 审核通过后，您将获得商家控制台访问权限</li>
          <li>• 可上架自有模型渠道，自主定价，赚取差价收益</li>
          <li>• 平台抽成 5%，按月结算</li>
          <li>• 如有疑问，请联系客服：support@leapnode.com</li>
        </ul>
      </div>
    </div>
  );
}
