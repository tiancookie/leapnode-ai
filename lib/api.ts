/**
 * API 客户端封装
 *
 * 认证机制（与 SubRouter 前端一致）：
 * - Cookie Session：leapnode_session（HttpOnly，浏览器自动携带）
 * - HTTP Header：New-Api-User: <userId>（前端注入）
 * 缺一即 401。
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://leapnode-backend-production.up.railway.app";

// 统一响应结构（后端契约）
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

// 从 localStorage 读取当前用户 ID（登录后存入）
function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("leapnode_user_id");
}

// 核心请求方法
async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // 注入 New-Api-User header（双重认证要求）
  const userId = getCurrentUserId();
  if (userId) {
    headers["New-Api-User"] = userId;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // 携带 Cookie（leapnode_session）
  });

  // 401 统一跳转登录
  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("leapnode_user_id");
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }

  const json = (await res.json()) as ApiResponse<T>;
  return json;
}

// HTTP 方法封装
export const api = {
  get: <T = unknown>(path: string) => request<T>(path, { method: "GET" }),

  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(path: string) =>
    request<T>(path, { method: "DELETE" }),
};

// SWR fetcher
export const fetcher = <T = unknown>(path: string) =>
  api.get<T>(path).then((res) => {
    if (!res.success) {
      throw new Error(res.message || "请求失败");
    }
    return res.data;
  });

export { API_BASE_URL, getCurrentUserId };
