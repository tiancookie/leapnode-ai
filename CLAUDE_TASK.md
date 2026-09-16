# LeapNode 用户前端开发任务

## 背景
你要为 LeapNode（AI API 聚合平台）开发**总站用户前端**。这是一个类似 OpenRouter 的多模型聚合平台，用户可以浏览模型、选择商家/渠道、充值、管理 API 密钥。

## 已搭建的基础设施（务必复用，不要重写）
- `lib/api.ts` — API 客户端（fetch 封装，自动注入认证 header + cookie）
- `lib/services.ts` — 业务 API 服务（authService/siteService/tokenService/topupService/affService/packageService）
- `lib/types.ts` — TypeScript 类型（User/Model/Merchant/Channel/Token/UsageLog/Package 等）
- `lib/store.ts` — Zustand 状态（useUserStore 用户态 / useUIStore UI态）
- `lib/utils.ts` — 工具函数（quotaToDollars/quotaToCNY/formatTimestamp/cn/copyToClipboard）
- `components/ui/` — 基础组件（Button/Card/Badge），已有深色主题样式
- `tailwind.config.ts` — 设计系统（颜色/圆角/阴影已配好）

## 技术栈
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4（深色主题）
- Zustand（状态）+ SWR（数据请求）
- 认证：Cookie session（leapnode_session）+ Header（New-Api-User），已在 api.ts 处理

## 设计系统（深色主题，参考 SubRouter）
- 背景：主 `#1a1a1a`、卡片 `#2a2a2a`、悬停 `#333333`
- 文字：主 `#ffffff`、次要 `#999999`、禁用 `#666666`
- 品牌色（青绿）：`#00d4aa`，悬停 `#00b894`
- 状态：成功 `#10b981`、警告 `#f59e0b`、错误 `#ef4444`
- 圆角：按钮 8px、卡片 12px、pill 999px、徽章 6px
- Tailwind 类名已映射：`bg-background`/`bg-background-card`/`text-foreground-muted`/`bg-primary` 等

## 要开发的页面（11 个）

### 优先级 P0（核心，先做）
1. **首页 `/`**
   - Hero：大标题「API, 连接全球模型」+ 副标题 + CTA 按钮（注册/登录）
   - 统计卡片：模型数、商家数、API 调用次数（可用 mock 数据 + 注释标注待接口）
   - 服务商图标墙：OpenAI/Anthropic/Google/阿里/百度/DeepSeek 等
   - 顶部导航栏（Header 组件）

2. **登录 `/login`** + **注册 `/register`**
   - 登录：用户名 + 密码，调 authService.login，成功后 setUser + 跳 /console
   - 注册：用户名 + 密码 + 邮箱 + 邀请码(ref，可选)，调 authService.register
   - 表单校验（用户名规则、密码 8-20 位）

3. **控制台 `/console`**
   - 顶部统计卡片（4个）：余额、今日调用、本月消费、成功率
   - 左侧模型卡片网格 + 右侧使用记录表格
   - 使用记录表格列：时间/操作类型/模型/消费/余额/状态（状态用 Badge 颜色）
   - 数据用 SWR 从 authService.getSelf、topupService.getHistory 拉

4. **模型市场 `/models`**
   - 顶部过滤器：供应商标签 + 能力标签（文本生成/代码/多模态/推理/长文本/函数调用/联网搜索）
   - 模型卡片（垂直列表）：图标+名称+版本、状态徽章、输入/输出价格、上下文窗口、能力评分条、使用按钮
   - 数据从 siteService.getModels 拉

### 优先级 P1（次要）
5. **商家目录 `/merchants`** — 3列卡片网格，商家logo/名称/验证徽章/描述/模型标签/价格/评分/CTA
6. **官方渠道 `/channels`** — 渠道卡片垂直列表，渠道信息/可用率徽章/模型列表/操作按钮
7. **钱包管理 `/wallet`** — 余额展示 + 充值入口（兑换码/USDT）+ 充值记录表格
8. **个人设置 `/settings`** — 基本信息 + 修改密码

### 优先级 P2（预留占位即可）
9. **订阅共享 `/subscriptions`** — 占位页
10. **探索 `/explore/skills`、`/explore/apps`、`/explore/leaderboard`** — 占位页

## 布局组件（必做）
- **Header**（`components/layout/Header.tsx`）：
  - 左：LeapNode logo
  - 中：导航菜单（模型/商家/官方渠道/订阅共享/探索下拉/控制台）
  - 右：通知图标 + 余额显示 + 用户头像下拉（钱包管理/令牌/控制台/个人设置/退出）
  - 未登录时右侧显示「登录/注册」按钮
  - 移动端：汉堡菜单
- **Footer**（`components/layout/Footer.tsx`）：简单版权 + 链接

## 用户下拉菜单项（参考截图）
钱包管理、令牌、控制台、经营站后台(user_level=3才显示)、商家中心(user_level=2才显示)、个人设置、退出(红色)

## 关键要求
1. **复用基础设施**：所有 API 调用走 lib/services.ts，不要自己写 fetch
2. **认证保护**：/console、/wallet、/settings 需登录，未登录跳 /login（用 useUserStore.isAuthenticated 判断）
3. **响应式**：卡片网格 3列(桌面)→2列(平板)→1列(移动)，导航栏移动端汉堡菜单
4. **类型安全**：用 lib/types.ts 的类型，不要 any
5. **接口未就绪的地方**：用 mock 数据 + `// TODO: 接 xxx 接口` 注释，不要让页面崩溃
6. **中文界面**：所有文案用中文
7. **编译通过**：`npx tsc --noEmit` 无错误，`npm run build` 成功

## 验证
完成后运行：
- `npx tsc --noEmit`（类型检查）
- `npm run build`（构建）
两者都要通过。

## 提交
分阶段 commit（P0 一个 commit，P1 一个，P2 一个），不要 push（我 review 后推）。
commit message 用中文，格式：`feat(前端): xxx`
