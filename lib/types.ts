/**
 * 数据类型定义（与后端契约对齐）
 */

export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  user_level: number; // 0=普通, 1=VIP, 2=商家, 3=分站
  role: number; // 1=普通, 10=管理员, 100=超级管理员
  quota: number;
  distributor_id: number;
  inviter_id: number;
  aff_code: string;
  created_time: number;
  status: number; // 1=启用, 2=禁用
  request_count?: number;
  used_quota?: number;
}

export interface RedeemCode {
  id: number;
  code: string;
  amount: number;
  status: number; // 0=未使用, 1=已使用, 2=已作废
  expire_time: number;
  used_by_user_id: number;
  used_at: number;
  merchant_id: number;
  created_time: number;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  quota: number;
  duration: number;
  quota_reset_period: string;
  visible: boolean;
  created_time: number;
}

export interface Channel {
  id: number;
  name: string;
  type?: number;
  key?: string;
  base_url?: string;
  models: string | Array<{ name: string; input_price: number; output_price: number; tags: string[] }>;
  status?: number;
  priority?: number;
  created_time?: number;
  provider?: string;
  key_availability?: number;
  model_availability?: number;
  ratio?: number | string;
  description?: string;
  registered_models?: any;
  activated_models?: any;
  available_keys?: number;
  official_url?: string;
  logo_url?: string;
}

export interface MerchantApplication {
  id: number;
  user_id: number;
  business_name: string;
  business_type: string;
  contact_email: string;
  contact_phone: string;
  reason: string;
  status: string; // pending/approved/rejected
  reviewed_at: number;
  reviewer_id: number;
  review_note: string;
  created_time: number;
}

export interface DistributorApplication {
  id: number;
  user_id: number;
  business_name: string;
  business_type: string;
  contact_email: string;
  contact_phone: string;
  reason: string;
  status: string;
  reviewed_at: number;
  reviewer_id: number;
  review_note: string;
  created_time: number;
}

export interface Referral {
  id: number;
  user_id: number;
  referrer_id: number;
  amount: number;
  type: string;
  status: string; // pending/settled
  settled_at: number;
  created_time: number;
}

export const USER_LEVEL_LABELS: Record<number, string> = {
  0: "普通用户",
  1: "VIP用户",
  2: "商家",
  3: "分站主",
};

export const USER_ROLE_LABELS: Record<number, string> = {
  1: "普通用户",
  10: "普通管理员",
  100: "超级管理员",
};

export const REDEEM_CODE_STATUS_LABELS: Record<number, string> = {
  0: "未使用",
  1: "已使用",
  2: "已作废",
};

// 其他页面需要的类型定义
export interface Model {
  id: number;
  name: string;
  input_price: number;
  output_price: number;
  tags?: string[];
  provider?: string;
  capabilities?: string[];
  display_name?: string;
  official_direct?: boolean;
  type?: string;
  context_window?: number;
  status?: number;
  web_search?: boolean;
}

export interface Merchant {
  id: number;
  user_id?: number;
  business_name?: string;
  status?: string;
  created_time?: number;
  name?: string;
  verified?: boolean;
  online?: boolean;
  logo_url?: string;
  description?: string;
  official_direct?: boolean;
  channels_count?: number;
  models_count?: number;
  model_count?: number; // 兼容 mock 数据
  rating?: number;
  tags?: string[];
  model_tags?: string[];
  response_time?: number;
  price_range?: string;
  review_count?: number;
  view_count?: number;
  favorite_count?: number;
}

export interface Token {
  id: number;
  name: string;
  key: string;
  created_time: number;
  status: number;
}

export interface UsageLog {
  id: number;
  user_id?: number;
  model?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  quota?: number;
  created_time?: number;
  created_at?: number | string;
  event_type?: string | number;
  model_name?: string;
  amount?: number;
  balance?: number;
  status?: string | number;
}

export interface TopupRecord {
  id: number;
  user_id: number;
  amount: number;
  method: string;
  created_time: number;
  status: string | number;
  created_at?: number;
  order_no?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  records?: T[];
}
