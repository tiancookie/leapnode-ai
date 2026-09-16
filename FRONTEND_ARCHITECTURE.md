# LeapNode 用户前端架构设计

## 项目信息
- **项目名称**：LeapNode Frontend（总站用户前端）
- **技术栈**：Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **后端 API**：https://leapnode-backend-production.up.railway.app
- **部署**：Railway
- **设计参考**：SubRouter 用户前端截图（11 张）

---

## 页面结构（11 个页面）

### 1. 首页 `/`
- Hero 区域：大标题 + 副标题 + CTA 按钮（注册/登录）
- 统计卡片：用户数、模型数、API 调用次数
- 服务商图标墙：OpenAI、Anthropic、Google、阿里、百度等
- 特色功能介绍：多模型聚合、统一计费、灵活定价

### 2. 模型市场 `/models`
- **筛选器**：
  - 顶部：供应商过滤（OpenAI、Anthropic、Google 等）
  - 能力标签：文本生成、代码、多模态、推理、长文本、函数调用、联网搜索
- **模型卡片**（垂直列表）：
  - 模型图标 + 名称 + 版本
  - 状态徽章（官方直连、支持联网搜索）
  - 定价：输入/输出价格（¥/1M tokens）
  - 上下文窗口：8k、128k 等
  - 能力评分条：基础能力、推理、代码、长文本（彩色横条）
  - 操作按钮：使用模型

### 3. 商家目录 `/merchants`
- **3 列卡片网格**：
  - 商家 Logo + 名称 + 验证徽章
  - 描述文案
  - 模型标签（gpt-4、claude、gemini）
  - 价格标签（¥0.21/次 或 ¥0.5/1M tokens）
  - 统计：响应时间、收藏数、浏览数
  - 评分：5 星评分 + 评价人数
  - CTA：查看模型和定价 Key
- **顶部过滤**：分类标签（中文版、机器翻译、口语练习等）

### 4. 官方渠道 `/channels`
- **渠道卡片**（垂直列表）：
  - 左侧：渠道图标 + 名称 + 官方渠道地址标签
  - 提供商信息 + 官网
  - 统计：已注册模型数、已激活模型数、可用 Key 数
  - 倍率信息
  - 可用率徽章：Key 可用率、模型可用率（绿色 100%、橙色 <80%）
  - 右侧：模型列表（前 3 个 + 展开按钮）
  - 操作按钮：添加 Key、查看详情
- **顶部过滤**：供应商过滤器 + 能力类型过滤器

### 5. 订阅共享 `/subscriptions`
（待补充截图，暂时预留）

### 6. 控制台 `/console`
- **顶部统计卡片**（4 个）：
  - 余额/积分
  - 今日调用次数
  - 本月消费
  - 其他指标（成功率、响应时间）
- **Submoi 聚合服务区域**：
  - 使用量 / 配额
  - 余额显示
  - 充值按钮
- **模型卡片网格**（左侧）：
  - 模型图标 + 名称 + 描述
  - 定价信息
  - 状态标签
  - 调用按钮
- **使用记录表格**（右侧）：
  - 列：时间戳、操作类型、模型名称、消费金额、余额、状态
  - 状态用颜色编码（绿色成功、红色失败）
  - 分页

### 7. Skill 市场 `/explore/skills`
（预留）

### 8. 应用市场 `/explore/apps`
（预留）

### 9. 排行榜 `/explore/leaderboard`
（预留）

### 10. 个人设置 `/settings`
- 基本信息：用户名、邮箱、头像
- 安全设置：修改密码、双因素认证
- 通知偏好

### 11. 钱包管理 `/wallet`
- 余额展示
- 充值入口
- 充值记录
- 消费记录

---

## 组件库（基于 shadcn/ui）

### 基础组件
- `Button`：主按钮、次按钮、幽灵按钮、图标按钮
- `Card`：深色卡片（比主背景稍亮）
- `Badge`：状态徽章（成功、警告、错误、中性）
- `Input`、`Textarea`、`Select`
- `Dialog`、`Sheet`、`Popover`
- `Tabs`、`Accordion`
- `Table`：深色表格（斑马条纹、悬停高亮）
- `Avatar`：用户头像

### 业务组件
- `ModelCard`：模型卡片（用于模型市场）
- `MerchantCard`：商家卡片（用于商家目录）
- `ChannelCard`：渠道卡片（用于官方渠道）
- `StatCard`：统计卡片（用于控制台）
- `FilterBar`：过滤器（标签云）
- `UsageTable`：使用记录表格
- `PricingDisplay`：价格展示（输入/输出价格）
- `CapabilityBar`：能力评分条（彩色横条）

### 布局组件
- `Header`：顶部导航栏（logo + 菜单 + 用户下拉）
- `Footer`：底部链接
- `Sidebar`：侧边栏（移动端）
- `UserDropdown`：用户下拉菜单

---

## 设计系统

### 配色方案（深色主题）
- **背景色**：
  - 主背景：`#1a1a1a`
  - 卡片背景：`#2a2a2a`
  - 悬停背景：`#333333`
- **文字颜色**：
  - 主文字：`#ffffff`
  - 次要文字：`#999999` 或 `#aaaaaa`
  - 禁用文字：`#666666`
- **品牌色**：
  - 主色（青绿色）：`#00d4aa` 或 `#06b6d4`
  - 主色悬停：`#00b894`
- **状态颜色**：
  - 成功：`#10b981`（绿色）
  - 警告：`#f59e0b`（琥珀色）
  - 错误：`#ef4444`（红色）
  - 信息：`#3b82f6`（蓝色）
- **边框颜色**：`#333333`
- **阴影**：`0 4px 6px rgba(0, 0, 0, 0.5)`

### 字体
- **英文 + 数字**：Inter（300-500 weight）
- **中文**：系统默认或 Noto Sans SC

### 圆角
- 按钮：`8px`
- 卡片：`12px`
- Pill 按钮：`999px`
- 徽章：`6px`

### 间距
- 容器最大宽度：`1280px`
- 卡片间距：`16px`（小屏）/ `24px`（大屏）
- 内边距：`16px`（移动）/ `24px`（桌面）

---

## 路由结构

```
/                        # 首页
/models                  # 模型市场
/merchants               # 商家目录
/channels                # 官方渠道
/subscriptions           # 订阅共享
/console                 # 用户控制台
/explore/skills          # Skill 市场
/explore/apps            # 应用市场
/explore/leaderboard     # 排行榜
/settings                # 个人设置
/wallet                  # 钱包管理
/login                   # 登录
/register                # 注册
```

---

## API 集成

### 认证机制
- **Cookie Session**：`leapnode_session`（HttpOnly）
- **HTTP Header**：`New-Api-User: <userId>`（前端注入）
- **登录接口**：`POST /api/auth/login`
- **注册接口**：`POST /api/auth/register`
- **退出接口**：`POST /api/auth/logout`

### API 客户端
- **库**：`axios`（支持拦截器）
- **Base URL**：`https://leapnode-backend-production.up.railway.app`
- **请求拦截器**：自动注入 `New-Api-User` header
- **响应拦截器**：401 自动跳转登录、统一错误处理

### 数据请求
- **SWR**：自动缓存 + 重验证（用于列表页）
- **React Query**：（备选方案）

---

## 状态管理

### 全局状态（Zustand）
- **用户状态**：`useUserStore`
  - `user`：当前用户信息（id, username, email, quota）
  - `isAuthenticated`：是否已登录
  - `login()`、`logout()`、`updateUser()`
- **UI 状态**：`useUIStore`
  - `sidebarOpen`：侧边栏开关（移动端）
  - `theme`：主题（深色/浅色，暂时只支持深色）

### 本地状态
- 表单状态：React Hook Form
- 列表状态：SWR 管理

---

## 响应式设计

### 断点
- **移动端**：`< 768px`
- **平板**：`768px - 1024px`
- **桌面**：`> 1024px`

### 适配策略
- 导航栏：桌面横向菜单 → 移动端汉堡菜单
- 卡片网格：3 列（桌面）→ 2 列（平板）→ 1 列（移动）
- 表格：桌面完整表格 → 移动端卡片列表

---

## 性能优化

1. **代码分割**：按路由懒加载
2. **图片优化**：Next.js Image 组件
3. **字体优化**：next/font 加载 Inter
4. **API 缓存**：SWR 缓存策略
5. **SSR/SSG**：首页、模型市场用 SSR，其他页面 CSR

---

## 部署配置（Railway）

### 环境变量
```env
NEXT_PUBLIC_API_BASE_URL=https://leapnode-backend-production.up.railway.app
NODE_ENV=production
```

### 构建命令
```bash
npm run build
```

### 启动命令
```bash
npm run start
```

### 端口
默认 `3000`，Railway 自动分配

---

## 开发计划

### Phase 1：基础设施（1 天）
- ✅ 项目初始化
- ⏳ 安装依赖：shadcn/ui、axios、zustand、swr
- ⏳ 配置 Tailwind（深色主题）
- ⏳ 搭建布局组件：Header、Footer
- ⏳ API 客户端封装
- ⏳ 认证流程：登录、注册、退出

### Phase 2：核心页面（2 天）
- 首页：Hero + 统计卡片
- 模型市场：筛选器 + 模型卡片
- 控制台：统计卡片 + 使用记录表格

### Phase 3：次要页面（1 天）
- 商家目录
- 官方渠道
- 钱包管理
- 个人设置

### Phase 4：测试 + 部署（0.5 天）
- E2E 测试
- Railway 部署
- 真机验证

**总工期**：约 4.5 天
