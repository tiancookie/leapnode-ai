# P0 总端管理后台技术规格

## 背景
LeapNode 四层 AI API 聚合平台（总站→分站→商家→二级返佣）。P1 分站后台已完成，现需 **P0 总端管理后台**（Super Admin）。

## 技术栈
- **前端**：Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **后端**：已完成部署 https://leapnode-backend-production.up.railway.app
- **设计系统**：复用现有暗黑主题（`tailwind.config.ts` 已定义）
  - 背景：`#1a1a1a` / `#2a2a2a`
  - 主色：`#00d4aa` (青绿)
  - 圆角：`lg=12px`, `full=999px`
- **前端项目结构**：
  - `app/` — Next.js App Router 页面
  - `components/` — 可复用组件
  - `lib/api.ts` — API 客户端（已存在，需扩展）
  - 无 `src/` 目录

## 已完成的 Admin API（31个）

### Dashboard（2个）
- `GET /api/admin/dashboard/stats` — 关键指标（用户数/分站数/总消耗/今日收入）
- `GET /api/admin/dashboard/charts` — 图表数据（7日/30日趋势）

### 用户管理（4个）
- `GET /api/admin/users` — 用户列表（分页/搜索/筛选）
- `GET /api/admin/users/:id` — 用户详情
- `PUT /api/admin/users/:id` — 编辑用户（user_level/role/quota）
- `DELETE /api/admin/users/:id` — 删除用户
- `POST /api/admin/users/:id/quota` — 调整余额（充值/扣款）

### 商家审核（4个）
- `GET /api/admin/merchants/pending` — 待审核商家列表
- `GET /api/admin/merchants/:id` — 商家申请详情
- `POST /api/admin/merchants/:id/approve` — 批准（升级 user_level=2）
- `POST /api/admin/merchants/:id/reject` — 拒绝（附理由）

### 分站审核（4个）
- `GET /api/admin/distributors/pending` — 待审核分站列表
- `GET /api/admin/distributors/:id` — 分站申请详情
- `POST /api/admin/distributors/:id/approve` — 批准（升级 user_level=3 + 创建 distributor_sites）
- `POST /api/admin/distributors/:id/reject` — 拒绝（附理由）

### 兑换码管理（3个）
- `POST /api/admin/redeem-codes/generate` — 批量生成（amount/count/expire_time/merchant_id?）
- `GET /api/admin/redeem-codes` — 兑换码列表（分页/搜索/状态筛选）
- `DELETE /api/admin/redeem-codes/:id` — 作废兑换码

### 套餐管理（5个）
- `GET /api/admin/packages` — 官方套餐列表
- `POST /api/admin/packages` — 创建套餐
- `PUT /api/admin/packages/:id` — 编辑套餐
- `DELETE /api/admin/packages/:id` — 删除套餐（保护：有订阅时拒绝）

### 渠道管理（5个）
- `GET /api/admin/channels` — 官方渠道列表
- `POST /api/admin/channels` — 创建渠道
- `PUT /api/admin/channels/:id` — 编辑渠道
- `DELETE /api/admin/channels/:id` — 删除渠道

### 返佣管理（3个）
- `GET /api/admin/referrals` — 返佣记录列表
- `GET /api/admin/referrals/stats` — 返佣统计（总额/待结算/已结算）
- `POST /api/admin/referrals/:id/settle` — 手动结算（审核通过后）

### 系统配置（2个）
- `GET /api/admin/config` — 系统配置（返佣比例/套餐可见性等）
- `PUT /api/admin/config` — 更新配置

## 认证机制
- **Cookie**: `leapnode_session`（登录后自动设置）
- **Header**: `New-Api-User: <userId>`（前端 `lib/api.ts` 已自动注入）
- **权限**: AdminAuth 中间件要求 `user.role >= 100`

## 前端开发要求

### 路由结构建议
```
/admin
  /dashboard          — 数据概览（stats + charts）
  /users              — 用户列表（搜索/筛选/编辑/充值）
    /[id]             — 用户详情
  /merchants/pending  — 商家申请审核
  /distributors/pending — 分站申请审核
  /redeem-codes       — 兑换码管理
  /packages           — 套餐管理
  /channels           — 渠道管理
  /referrals          — 返佣管理
  /settings           — 系统配置
```

### UI 规范
1. **侧边栏导航**：固定左侧，展开/收起状态，当前路由高亮
2. **顶部栏**：面包屑 + 用户菜单（admin 身份 + 登出）
3. **表格组件**：复用/新建可配置 DataTable（分页/排序/搜索）
4. **表单组件**：统一样式（label + input + error message）
5. **审核流程**：申请详情 Modal + 批准/拒绝按钮 + 理由输入框
6. **响应式**：桌面优先（管理后台主要桌面使用）

### 关键字段契约

#### User
- `id` (int) — 用户 ID
- `username` (string) — 用户名
- `email` (string)
- `display_name` (string) — 显示名称
- `user_level` (int) — 0=普通用户, 1=VIP, 2=商家, 3=分站主
- `role` (int) — 1=普通, 10=普通管理员, 100=超级管理员
- `quota` (int) — 余额（500,000 = $1.00）
- `distributor_id` (int) — 归属分站 ID
- `inviter_id` (int) — 邀请人 ID
- `aff_code` (string) — 推广码
- `created_time` (int) — 注册时间（Unix 秒）

#### RedeemCode
- `id` (int)
- `code` (string) — 格式 `LEAP-XXXXXXXX`
- `amount` (int) — 充值金额（quota）
- `status` (int) — 0=未使用, 1=已使用, 2=已作废
- `expire_time` (int) — 过期时间（Unix 秒）
- `used_by_user_id` (int) — 使用者 ID
- `used_at` (int) — 使用时间
- `merchant_id` (int) — 归属商家（0=官方）

#### Package
- `id` (int)
- `name` (string) — 套餐名称
- `description` (string) — 描述
- `price` (int) — 价格（quota）
- `quota` (int) — 包含余额
- `duration` (int) — 有效期（天）
- `quota_reset_period` (string) — 重置周期（"none"/"daily"/"monthly"）
- `visible` (bool) — 是否可见

#### Channel
- `id` (int)
- `name` (string) — 渠道名称
- `type` (int) — 类型（参考 New-API）
- `key` (string) — API Key
- `base_url` (string) — Base URL
- `models` (string) — 支持的模型（逗号分隔）
- `status` (int) — 1=启用, 2=禁用
- `priority` (int) — 优先级

#### MerchantApplication / DistributorApplication
- `id` (int)
- `user_id` (int) — 申请人 ID
- `business_name` (string) — 业务名称
- `business_type` (string) — 业务类型
- `contact_email` (string)
- `contact_phone` (string)
- `reason` (string) — 申请理由
- `status` (string) — "pending"/"approved"/"rejected"
- `reviewed_at` (int) — 审核时间
- `reviewer_id` (int) — 审核人 ID
- `review_note` (string) — 审核备注

#### DashboardStats
- `total_users` (int)
- `total_distributors` (int)
- `total_consumption` (int) — 总消耗（quota）
- `today_revenue` (int) — 今日收入（quota）
- `active_users_7d` (int) — 7日活跃用户
- `new_users_7d` (int) — 7日新增用户

## API 调用示例

### 获取用户列表
```typescript
const response = await api.get('/admin/users', {
  params: { page: 1, page_size: 20, keyword: 'test' }
});
// response.data: { users: User[], total: number }
```

### 审批商家申请
```typescript
await api.post('/admin/merchants/123/approve');
// 或拒绝
await api.post('/admin/merchants/123/reject', {
  review_note: '资质不符'
});
```

### 生成兑换码
```typescript
await api.post('/admin/redeem-codes/generate', {
  amount: 500000,      // 充值金额（quota）
  count: 100,          // 生成数量
  expire_time: 1735689600, // 过期时间（Unix秒）
  merchant_id: 0       // 0=官方
});
```

## 开发顺序建议（按依赖关系）
1. **Dashboard** — 数据概览（最简单，验证 API 连通性）
2. **用户管理** — 核心功能（列表/详情/编辑/充值）
3. **审核中心** — 商家/分站申请审核（业务关键）
4. **兑换码管理** — 运营工具
5. **套餐管理** — 产品配置
6. **渠道管理** — 技术配置
7. **返佣管理** — 财务对账
8. **系统配置** — 全局设置

## 注意事项
1. **quota 显示转换**：后端存储 quota (int)，前端显示转换为美元（`quota / 500000`）或人民币（`quota / 500000 * 7.14`）
2. **时间戳转换**：后端返回 Unix 秒，前端转本地时间显示
3. **权限校验**：所有 admin 页面需检查 `user.role >= 100`，未授权跳转登录
4. **错误处理**：统一 Toast 提示，API 错误显示 `response.message`
5. **加载状态**：表格/表单提交时显示 loading
6. **确认对话框**：删除/拒绝等破坏性操作需二次确认

## 部署
- **后端**：https://leapnode-backend-production.up.railway.app（已部署）
- **前端**：本地开发 `npm run dev`（http://localhost:3000），Railway 部署另行配置

---

**开发方式**: 按上述顺序逐个功能模块开发，每完成一个模块验证 API 连通性后继续下一个。
