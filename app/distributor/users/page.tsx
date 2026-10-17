"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher, api } from "@/lib/api";
import Link from "next/link";

interface DistributorUser {
  id: number;
  username: string;
  email: string;
  quota: number;
  used_quota: number;
  request_count: number;
  status: number;
  created_time: number;
}

export default function DistributorUsersPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const limit = 20;

  const { data, error } = useSWR<{ users: DistributorUser[]; total: number }>(
    `/api/distributor/users?page=${page}&limit=${limit}&keyword=${keyword}`,
    fetcher
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="card">
          <p className="text-error">加载失败：{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <p className="text-center text-secondary">加载中...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / limit);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-heading-1 mb-3">用户管理</h1>
        <p className="text-body">查看和管理您的分站用户</p>
      </div>

      {/* 搜索 */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索用户名或邮箱..."
            className="flex-1 px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--color-brand)]"
          />
          <button type="submit" className="btn btn-primary">
            搜索
          </button>
        </form>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div className="card">
          <p className="text-small mb-1">总用户数</p>
          <p className="text-2xl font-semibold">{data.total}</p>
        </div>
        <div className="card">
          <p className="text-small mb-1">本页显示</p>
          <p className="text-2xl font-semibold">{data.users.length}</p>
        </div>
        <div className="card">
          <p className="text-small mb-1">总页数</p>
          <p className="text-2xl font-semibold">{totalPages}</p>
        </div>
        <div className="card">
          <p className="text-small mb-1">当前页</p>
          <p className="text-2xl font-semibold">{page}</p>
        </div>
      </div>

      {/* 用户表格 */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>邮箱</th>
              <th className="text-right">余额</th>
              <th className="text-right">已用</th>
              <th className="text-right">调用次数</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <tr key={user.id}>
                <td className="font-medium">{user.username}</td>
                <td>{user.email || "-"}</td>
                <td className="text-right">
                  ${(user.quota / 500000).toFixed(2)}
                </td>
                <td className="text-right text-secondary">
                  ${(user.used_quota / 500000).toFixed(2)}
                </td>
                <td className="text-right">{user.request_count.toLocaleString()}</td>
                <td>
                  <span className={user.status === 1 ? "badge badge-success" : "badge badge-error"}>
                    {user.status === 1 ? "正常" : "禁用"}
                  </span>
                </td>
                <td className="text-sm text-secondary">
                  {new Date(user.created_time * 1000).toLocaleDateString()}
                </td>
                <td>
                  <Link href={`/distributor/users/${user.id}`}>
                    <button className="btn btn-ghost btn-sm">详情</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-secondary">
          共 {data.total} 个用户，第 {page} / {totalPages} 页
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
          >
            上一页
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary btn-sm"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
