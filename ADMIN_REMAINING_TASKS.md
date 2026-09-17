# P0 管理后台剩余任务

## ✅ 已完成
- `components/admin/AdminLayout.tsx` — 侧边栏 + 9个菜单项
- `components/admin/DataTable.tsx` — 通用表格（分页/排序/搜索）
- `components/admin/Modal.tsx` — 通用 Modal
- `app/admin/layout.tsx` — Admin 布局入口
- `app/admin/dashboard/page.tsx` — Dashboard（stats + charts）

## 🚧 待实现（7 个页面）

### 1. 用户管理 `app/admin/users/page.tsx`
**功能：**
- 用户列表表格（`GET /api/admin/users?page=1&page_size=20&keyword=&user_level=`）
  - 筛选：user_level（全部/0普通/1VIP/2商家/3分站）
  - 搜索：username/email
  - 列：ID/用户名/邮箱/等级/角色/余额/注册时间
  - 操作：查看详情、编辑、调整Quota、删除
- **查看详情 Modal**：`GET /api/admin/users/:id`，展示完整用户信息
- **编辑 Modal**：表单更新 user_level/role/display_name，`PUT /api/admin/users/:id`
- **调整 Quota Modal**：输入 quota_delta（正数充值/负数扣减），`POST /api/admin/users/:id/quota`
- **删除确认**：`DELETE /api/admin/users/:id`

**字段契约：**
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  user_level: number; // 0=普通, 1=VIP, 2=商家, 3=分站
  role: number; // 1=普通, 10=管理员, 100=超级管理员
  quota: number; // 余额（500000 = $1.00）
  distributor_id: number;
  inviter_id: number;
  aff_code: string;
  created_time: number; // Unix 秒
}
```

---

### 2. 商家审核 `app/admin/merchants/pending/page.tsx`
**功能：**
- 待审核列表表格（`GET /api/admin/merchants/pending`）
  - 列：ID/申请人/业务名称/业务类型/联系方式/申请时间
  - 操作：查看详情、批准、拒绝
- **详情 Modal**：`GET /api/admin/merchants/:id`，展示完整申请信息
- **批准按钮**：`POST /api/admin/merchants/:id/approve`
- **拒绝 Modal**：输入 review_note（拒绝理由），`POST /api/admin/merchants/:id/reject`

**字段契约：**
```typescript
interface MerchantApplication {
  id: number;
  user_id: number;
  username: string;
  business_name: string;
  business_type: string;
  contact_email: string;
  contact_phone: string;
  reason: string;
  status: string; // "pending"/"approved"/"rejected"
  created_at: number;
  reviewed_at?: number;
  reviewer_id?: number;
  review_note?: string;
}
```

---

### 3. 分站审核 `app/admin/distributors/pending/page.tsx`
**功能：**
- 待审核列表表格（`GET /api/admin/distributors/pending`）
  - 列：ID/申请人/分站名称/业务类型/联系方式/申请时间
  - 操作：查看详情、批准、拒绝
- **详情 Modal**：`GET /api/admin/distributors/:id`
- **批准按钮**：`POST /api/admin/distributors/:id/approve`
- **拒绝 Modal**：输入 review_note，`POST /api/admin/distributors/:id/reject`

**字段契约：** 同 MerchantApplication

---

### 4. 兑换码管理 `app/admin/redeem-codes/page.tsx`
**功能：**
- 兑换码列表表格（`GET /api/admin/redeem-codes?page=1&page_size=20&status=`）
  - 筛选：status（全部/0未使用/1已使用/2已作废）
  - 列：ID/兑换码/金额/状态/使用者/过期时间/创建时间
  - 操作：生成（批量）、作废
- **生成 Modal**：表单输入 amount（quota）/count（数量）/expire_time（过期时间，时间选择器转 Unix 秒）/merchant_id（默认0=官方），`POST /api/admin/redeem-codes/generate`
- **作废按钮**：`DELETE /api/admin/redeem-codes/:id`

**字段契约：**
```typescript
interface RedeemCode {
  id: number;
  code: string; // LEAP-XXXXXXXX
  amount: number; // quota
  status: number; // 0=未使用, 1=已使用, 2=已作废
  expire_time: number; // Unix 秒
  used_by_user_id?: number;
  used_at?: number;
  merchant_id: number;
  created_at: number;
}
```

---

### 5. 套餐管理 `app/admin/packages/page.tsx`
**功能：**
- 套餐列表表格（`GET /api/admin/packages`）
  - 列：ID/名称/描述/价格/包含余额/有效期/可见性
  - 操作：创建、编辑、删除
- **创建/编辑 Modal**：表单（name/description/price/quota/duration/quota_reset_period/visible），`POST /api/admin/packages` 或 `PUT /api/admin/packages/:id`
- **删除确认**：`DELETE /api/admin/packages/:id`（有订阅时后端拒绝）

**字段契约：**
```typescript
interface Package {
  id: number;
  name: string;
  description: string;
  price: number; // quota
  quota: number; // 包含余额
  duration: number; // 天
  quota_reset_period: string; // "none"/"daily"/"monthly"
  visible: boolean;
}
```

---

### 6. 渠道管理 `app/admin/channels/page.tsx`
**功能：**
- 渠道列表表格（`GET /api/admin/channels`）
  - 列：ID/名称/类型/Base URL/模型/状态/优先级
  - 操作：创建、编辑、删除
- **创建/编辑 Modal**：表单（name/type/key/base_url/models/status/priority），`POST /api/admin/channels` 或 `PUT /api/admin/channels/:id`
- **删除确认**：`DELETE /api/admin/channels/:id`

**字段契约：**
```typescript
interface Channel {
  id: number;
  name: string;
  type: number;
  key: string; // 显示时脱敏（mask 中间字符）
  base_url: string;
  models: string; // 逗号分隔
  status: number; // 1=启用, 2=禁用
  priority: number;
}
```

---

### 7. 返佣管理 `app/admin/referrals/page.tsx`
**功能：**
- 返佣统计卡片（`GET /api/admin/referrals/stats`）
  - 总返佣额/待结算/已结算
- 返佣记录列表表格（`GET /api/admin/referrals?page=1&page_size=20`）
  - 列：ID/用户/返佣金额/状态/创建时间
  - 操作：结算（仅 pending 状态）
- **结算按钮**：`POST /api/admin/referrals/:id/settle`

**字段契约：**
```typescript
interface Referral {
  id: number;
  user_id: number;
  username: string;
  amount: number; // quota
  status: string; // "pending"/"settled"
  created_at: number;
  settled_at?: number;
}

interface ReferralStats {
  total_amount: number;
  pending_amount: number;
  settled_amount: number;
}
```

---

## 技术约定
1. **API 调用**：复用 `lib/api.ts` 的 `api.get/post/put/delete`
2. **组件复用**：
   - `<DataTable>` — 所有列表页
   - `<Modal>` — 所有弹窗
   - `<Card>` — 统计卡片
   - `<Button>` — 所有按钮
   - `<Input>` — 所有输入框
3. **错误处理**：`try-catch` + toast 提示
4. **加载状态**：表格/表单 loading
5. **权限**：所有页面需检查 `user.role >= 100`（已在 `app/admin/layout.tsx` 处理）
6. **quota 转换**：显示时 `quotaToDollars(quota)` 或 `quotaToCNY(quota)`（`lib/utils.ts` 已有）
7. **时间显示**：Unix 秒转本地时间（`formatTimestamp` 工具函数）
8. **确认对话框**：删除/拒绝等破坏性操作用原生 `confirm()` 或自定义确认 Modal

---

## 实现顺序
1. 用户管理（核心，操作最多）
2. 商家审核 + 分站审核（业务关键，结构相似可复用）
3. 兑换码管理（运营工具）
4. 套餐管理 + 渠道管理（配置页面，结构相似）
5. 返佣管理（财务对账）

---

## 参考文件
- 已完成 Dashboard：`app/admin/dashboard/page.tsx`
- 通用组件：`components/admin/DataTable.tsx`、`components/admin/Modal.tsx`
- API 客户端：`lib/api.ts`
- 工具函数：`lib/utils.ts`（quotaToDollars/formatTimestamp）
- 类型定义：`lib/types.ts`

---

## 部署验证
- 本地：`npm run dev`，访问 http://localhost:3000/admin/*
- 后端：https://leapnode-backend-production.up.railway.app
- 测试账号：leapnode_admin（id=8, role=100）

---

一次性完成全部 7 个页面。
