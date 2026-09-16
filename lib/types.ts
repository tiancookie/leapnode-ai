/**
 * 后端 API 数据类型定义
 * 对齐 leapnode-backend 的响应契约
 */

// 用户信息
export interface User {
  id: number;
  username: string;
  display_name: string;
  email: string;
  role: number; // 1=普通用户, 100=管理员
  status: number; // 1=正常
  quota: number; // 余额（quota 单位）
  used_quota: number;
  request_count: number;
  aff_code: string; // 邀请码
  aff_count: number;
  aff_quota: number; // 返佣余额
  aff_history_quota: number;
  created_time: number; // Unix 秒
  group: string;
  user_level: number; // 0=普通, 2=商家, 3=分站主
  announcement_email_enabled: boolean;
}

// 模型（模型市场）
export interface Model {
  id: number;
  name: string;
  display_name: string;
  provider: string;
  type: string; // chat / embedding / image
  input_price: number; // ¥/1M tokens
  output_price: number;
  context_window: number;
  capabilities: string[]; // ['文本生成', '代码', '多模态']
  status: number;
  official_direct: boolean; // 官方直连
  web_search: boolean; // 支持联网搜索
}

// 商家
export interface Merchant {
  id: number;
  name: string;
  logo_url: string;
  description: string;
  verified: boolean;
  model_tags: string[]; // ['gpt-4', 'claude']
  price_range: string; // '¥0.21/次'
  response_time: number; // ms
  favorite_count: number;
  view_count: number;
  rating: number; // 0-5
  review_count: number;
  online: boolean;
  model_count: number;
}

// 官方渠道
export interface Channel {
  id: number;
  name: string;
  logo_url: string;
  provider: string;
  official_url: string;
  description: string;
  registered_models: number;
  activated_models: number;
  available_keys: number;
  ratio: string; // '1x - 不翻倍'
  key_availability: number; // 0-100
  model_availability: number; // 0-100
  models: ChannelModel[];
}

export interface ChannelModel {
  name: string;
  input_price: number;
  output_price: number;
  tags: string[];
}

// Token（API 密钥）
export interface Token {
  id: number;
  name: string;
  key: string; // 显示时拼 "sk-" + key
  status: number; // 1=启用, 2=禁用
  created_time: number;
  accessed_time: number;
  expired_time: number; // -1=永不过期
  remain_quota: number;
  unlimited_quota: boolean;
  used_quota: number;
  model_limits: string;
  model_limits_enabled: boolean;
  group: string;
}

// 使用记录（控制台）
export interface UsageLog {
  id: number;
  created_at: string; // 格式化时间
  event_type: string; // API 调用 / 充值 / 扣费
  model_name: string;
  amount: number; // 消费金额（负数=扣费）
  balance: number; // 操作后余额
  status: number; // 1=成功, 0=失败
}

// 充值记录
export interface TopupRecord {
  id: number;
  created_at: string;
  method: string; // 兑换码 / USDT / 支付宝
  amount: number;
  status: number;
  order_no: string;
}

// 套餐
export interface Package {
  id: number;
  name: string;
  description: string;
  price: number; // 现价
  original_price: number; // 原价
  quota: number; // 总额度
  duration: number; // 有效期（天）
  quota_reset_period: string; // 不重置/每日/每周/每月
  status: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  records: T[];
  total: number;
  page: number;
  page_size: number;
}
