/**
 * 业务 API 服务模块
 * 封装所有后端接口调用
 */

import { api } from "./api";
import type {
  User,
  Model,
  Merchant,
  Channel,
  Token,
  UsageLog,
  TopupRecord,
  Package,
  PaginatedResponse,
} from "./types";

// ============ 认证 ============
export const authService = {
  login: (username: string, password: string) =>
    api.post<User>("/api/dist/user/login", { username, password }),

  register: (data: {
    username: string;
    password: string;
    email?: string;
    ref?: string; // 邀请码
  }) => api.post<User>("/api/dist/user/register", data),

  logout: () => api.post("/api/dist/user/logout"),

  getSelf: () => api.get<User>("/api/dist/user/self"),

  updatePassword: (oldPassword: string, newPassword: string) =>
    api.put("/api/dist/user/password", {
      old_password: oldPassword,
      new_password: newPassword,
    }),
};

// ============ 站点信息（公开） ============
export const siteService = {
  getInfo: () => api.get("/api/dist/site/info"),
  getModels: () => api.get<Model[]>("/api/dist/site/models"),
  getPricing: () => api.get("/api/dist/site/pricing"),
  getPackages: () => api.get<Package[]>("/api/dist/site/packages"),
  getOfficialChannels: () => api.get<Channel[]>("/api/dist/site/official-channels"),
  getKeyGroups: () => api.get("/api/dist/site/key-groups"),
};

// ============ Token 管理 ============
export const tokenService = {
  list: () => api.get<Token[]>("/api/dist/token/list"),

  create: (data: {
    name: string;
    expired_time?: number;
    unlimited_quota?: boolean;
    remain_quota?: number;
    model_limits?: string;
    group?: string;
  }) => api.post<Token>("/api/dist/token/create", data),

  update: (id: number, data: Partial<Token>) =>
    api.put<Token>(`/api/dist/token/${id}`, data),

  delete: (id: number) => api.delete(`/api/dist/token/${id}`),

  getModels: (id: number) => api.get(`/api/dist/token/${id}/models`),
};

// ============ 充值 ============
export const topupService = {
  getInfo: () => api.get("/api/dist/topup/info"),

  redeem: (code: string) => api.post("/api/dist/topup/redeem", { code }),

  getHistory: (page = 1, pageSize = 20) =>
    api.get<PaginatedResponse<TopupRecord>>(
      `/api/dist/topup/history?page=${page}&page_size=${pageSize}`
    ),

  // USDT 充值
  cryptoPay: (amount: number) =>
    api.post("/api/dist/topup/crypto/pay", { amount }),

  cryptoStatus: (orderNo: string) =>
    api.get(`/api/dist/topup/crypto/status?order_no=${orderNo}`),
};

// ============ 返佣系统 ============
export const affService = {
  getCode: () => api.get("/api/dist/aff"),
  getEarnings: () => api.get("/api/dist/aff_earnings"),
  transfer: (amount: number) => api.post("/api/dist/aff_transfer", { amount }),
  withdraw: (amount: number, method: string, accountInfo: string) =>
    api.post("/api/dist/aff_withdraw", {
      amount,
      method,
      account_info: accountInfo,
    }),
  getInvitees: () => api.get("/api/dist/aff/invitees"),
  getStats: () => api.get("/api/dist/aff/stats"),
};

// ============ 套餐订阅 ============
export const packageService = {
  subscribe: (packageId: number) =>
    api.post(`/api/dist/package/${packageId}/subscribe`),

  getActive: () => api.get("/api/dist/subscription/active"),
};
