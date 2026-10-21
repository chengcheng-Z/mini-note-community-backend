# 小红书风格内容社区前端 — Design

## 方案概述

采用 `React 18 + Vite + TypeScript` 构建单页应用：

- 路由：`react-router-dom`
- 服务端状态：`@tanstack/react-query`（缓存、无限滚动、乐观更新）
- 登录态：React Context + `localStorage`
- 样式：CSS Modules + 全局设计变量，不引入 UI 组件库，保证体积和风格可控
- 测试：`Vitest + React Testing Library + MSW`
- 视频：原生 `<video>` 播 mp4/m3u8（Safari），其他浏览器 m3u8 用 `hls.js`

不选 Next.js：无 SEO 和 SSR 需求，纯 SPA 部署更简单，也避免 SSR 下的 token 处理复杂度。
不选 Redux：服务端状态交给 React Query，登录态用 Context 足够。

## 目录结构

```text
frontend/
├── specs/community-frontend/{spec.md,design.md,tasks.md}
├── src/
│   ├── api/
│   │   ├── client.ts          # fetch 封装、鉴权头、错误映射、401 处理
│   │   ├── types.ts           # 后端契约类型（唯一事实来源）
│   │   ├── auth.ts
│   │   ├── notes.ts
│   │   ├── users.ts
│   │   ├── relations.ts
│   │   └── files.ts
│   ├── mocks/
│   │   ├── data.ts            # 与契约一致的假数据
│   │   ├── handlers.ts
│   │   └── browser.ts
│   ├── components/
│   │   ├── NoteCard.tsx
│   │   ├── WaterfallGrid.tsx
│   │   ├── LikeButton.tsx
│   │   ├── FollowButton.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── ImageCarousel.tsx
│   │   ├── TopBar.tsx
│   │   ├── TabBar.tsx
│   │   ├── Uploader.tsx
│   │   └── states/{Skeleton,EmptyState,ErrorState}.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── NoteDetailPage.tsx
│   │   ├── PublishPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── hooks/
│   │   ├── useAuth.tsx
│   │   ├── useInfiniteFeed.ts
│   │   ├── useLike.ts
│   │   └── useFollow.ts
│   ├── styles/{tokens.css,global.css}
│   ├── router.tsx
│   ├── App.tsx
│   └── main.tsx
├── tests/
├── .env.example
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 路由设计

| 路径 | 页面 | 是否需要登录 |
|---|---|---|
| `/login` | 登录/注册 | 否 |
| `/` | 首页 feed | 否（互动需登录） |
| `/note/:id` | 笔记详情 | 否（互动需登录） |
| `/publish` | 发布笔记 | 是 |
| `/profile` | 我的主页 | 是 |
| `/profile/:userId` | 他人主页（P1） | 否 |
| `*` | 404 | 否 |

布局：移动端底部 TabBar（首页、发布、我的）；桌面端左侧导航栏 + 居中内容区，最大宽度 1200px。

## API 契约

### 通用约定

- 前端统一请求前缀：`/api`
- 开发期 Vite 代理：`/api` → `http://localhost:8000`，并重写去掉 `/api`
- 鉴权头：`Authorization: Bearer <token>`（后端 `sa-token.token-prefix=Bearer`）
- 统一响应：`{ success: boolean; message?: string; errorCode?: string; data?: T }`
- 分页响应：`Response<T[]>` + `{ pageNo, pageSize, totalCount, totalPage }`
- 后端字段为 camelCase；时间字段按 `LocalDateTime` 字符串处理，前端只做展示，不做严格解析。

### 已有接口（前端直接使用）

| 方法 | 路径 | 入参 | 返回 |
|---|---|---|---|
| POST | `/auth/login` | `{ phone, type: 1\|2, code?, password? }` | `Response<string>`（token 原文） |
| POST | `/auth/logout` | - | `Response<null>` |
| POST | `/auth/verification/code/send` | `{ phone }` | `Response<null>` |
| POST | `/user/findById` | `{ userId }` | `Response<UserInfo>` |
| POST | `/user/findByIds` | `{ userIds }` | `Response<UserInfo[]>` |
| POST | `/user/update` | multipart | `Response<null>` |
| POST | `/note/detail` | `{ id }` | `Response<NoteDetail>` |
| POST | `/note/publish` | `{ type: 0\|1, imgUris?, videoUri?, title?, content?, topicId? }` | `Response<null>` |
| POST | `/note/delete` | `{ id }` | `Response<null>` |
| POST | `/relation/follow` | `{ followUserId }` | `Response<null>` |
| POST | `/relation/unfollow` | `{ followUserId }` | `Response<null>` |
| POST | `/relation/following/list` | `{ userId, pageNo }` | `PageResponse<UserInfo>` |
| POST | `/relation/fans/list` | `{ userId, pageNo }` | `PageResponse<UserInfo>` |
| POST | `/file/upload` | multipart `file` | `Response<string>`（文件 URL） |

### 需要后端补齐的接口（用户负责）

| 方法 | 路径 | 入参 | 返回 | 用途 |
|---|---|---|---|---|
| POST | `/note/feed` | `{ pageNo, pageSize, tab: "recommend"\|"follow"\|"mine" }` | `PageResponse<NoteFeedItem>` | 首页/关注/我的作品 |
| POST | `/note/like` | `{ noteId }` | `Response<null>` | 点赞 |
| POST | `/note/unlike` | `{ noteId }` | `Response<null>` | 取消点赞 |
| POST | `/note/liked/status` | `{ noteIds: number[] }` | `Response<Record<string, boolean>>` | 批量点赞状态 |
| POST | `/user/me` | - | `Response<UserInfo>` | 当前登录用户 |
| POST | `/relation/status` | `{ userId }` | `Response<{ following: boolean }>` | 关注状态 |

### 关键类型

```ts
type Response<T> = {
  success: boolean;
  message?: string;
  errorCode?: string;
  data: T;
};

type PageResponse<T> = Response<T[]> & {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
};

type UserInfo = {
  id: number;
  nickName: string;
  avatar: string;
  introduction?: string;
};

type NoteFeedItem = {
  id: number;
  type: 0 | 1;           // 0 图文，1 视频
  title: string;
  cover: string;         // 列表封面；无封面时前端回退到 imgUris[0] 或视频首帧
  videoUri?: string;
  videoDuration?: number; // 秒，用于时长角标
  creator: Pick<UserInfo, "id" | "nickName" | "avatar">;
  likeCount: number;
  liked: boolean;        // 后端根据当前登录用户返回
  createTime: string;
};

type NoteDetail = {
  id: number;
  type: 0 | 1;
  title: string;
  content: string;
  imgUris: string[];
  videoUri?: string;
  topicId?: number;
  topicName?: string;
  creatorId: number;
  creatorName: string;
  avatar: string;
  updateTime: string;
  visible: 0 | 1;
  likeCount: number;
  liked: boolean;
  following: boolean;
};
```

> 若后端选择“详情不返回点赞/关注状态”，前端改为进入详情后调用 `/note/liked/status` 与 `/relation/status`，类型适配层已预留。

### 网关前置修复（后端负责）

1. 当前网关对 `note/user/relation` 配置了 `StripPrefix=1`，但对应控制器路径自带 `/note`、`/user`、`/relation` 前缀，会 404。
   - 方案 A：去掉这三个路由的 `StripPrefix=1`（推荐，控制器不再改）。
   - 方案 B：修改控制器路径为无前缀。
2. 网关增加 `/file/**` 路由到 `xiaohashu-oss`，否则前端无法上传。
3. 解决跨域：开发期用 Vite 代理；生产期用 nginx 把 `/api` 同源代理到网关，或网关统一配置 CORS。

## 认证流程

```text
登录页 → POST /api/auth/login → data 为 token 原文
      → localStorage.setItem("xh_token", token)
      → 后续每个请求带 Authorization: Bearer <token>
      → 401 / success=false 且未登录 → 清 token → /login?redirect=<当前路径>
      → 登录成功回跳 redirect
```

- 登录方式：仅手机号验证码登录（自动注册）；密码登录接口保留但首版不展示，因为新注册用户没有密码。
- 发送验证码按钮 180 秒倒计时（后端同手机号 3 分钟内只允许发送一次），手机号前端校验 11 位。
- 短信由后端异步发送，接口成功不代表短信一定送达；失败时提示用户稍后重试。
- 退出：调用 `/auth/logout`，无论成功与否都清本地 token。

## 数据层设计

- `QueryClient` 默认：`staleTime: 30s`、`retry: 1`、`refetchOnWindowFocus: false`。
- 首页：`useInfiniteQuery`，`queryKey: ["feed", tab, loggedIn]`，`getNextPageParam` 用 `pageNo < totalPage`。
- 详情：`queryKey: ["note", id]`；从 feed 打开时先用 `initialData` 渲染，减少白屏。
- 点赞：`useMutation` + `onMutate` 乐观更新 feed 与 detail 缓存，`onError` 回滚，`onSettled` 失效相关 query。
- 关注：同上，更新 detail 与 profile 缓存。
- 发布成功：失效 `["feed"]` 与 `["profile"]`，跳转详情。

查询键约定：

```ts
["me"]
["feed", "recommend" | "follow" | "mine"]
["note", id]
["liked", noteIds.join(",")]
["relation", userId]
```

## 页面与组件

### 首页 `/`

- 顶部：Logo、推荐/关注切换（未登录点关注 → 登录页）。
- 内容：CSS 多列瀑布流（`columns: 2`，桌面 5 列），卡片 `break-inside: avoid`。
- 每张卡片：封面（固定宽高比，懒加载）、视频时长角标、标题（最多 2 行）、作者、点赞按钮。
- 加载：首屏 10 个骨架卡片；触底用 `IntersectionObserver` 加载下一页；无更多显示文案。
- 视频卡片：`IntersectionObserver` 可见时静音自动播放，不可见暂停；`prefers-reduced-motion` 时关闭自动播放。

### 详情 `/note/:id`

- 顶部返回、作者信息、关注按钮。
- 图文：横向轮播，支持左右按钮与圆点。
- 视频：`VideoPlayer`，mp4 原生播放，m3u8 用 hls.js；加载失败显示“视频加载失败”。
- 正文：保留换行，纯文本渲染，不使用 `dangerouslySetInnerHTML`。
- 底部：点赞按钮 + 数量、分享（复制当前 URL）。
- 自定义 hook 记录首页滚动位置，返回时恢复。

### 发布 `/publish`

- 选择类型：图文（最多 9 张）/ 视频（1 个）。
- 上传：逐个调用 `/file/upload`，显示总进度；全部成功后才允许提交。
- 表单：标题（最多 20 字）、正文（最多 1000 字）。
- 校验：图片 ≤10MB、视频 ≤200MB、类型白名单。
- 成功后回首页并失效 feed 缓存；失败保留表单并提示。后端发布接口不返回笔记 ID，因此第一版不跳详情。

### 我的 `/profile`

- 调用 `/user/me` 展示头像、昵称、简介。
- Tab：笔记 / 关注 / 粉丝；笔记用 `/note/feed?tab=mine`，关注粉丝用已有分页接口。
- 退出登录按钮。

### 通用状态组件

- `Skeleton`：骨架屏。
- `EmptyState`：插图 + 文案 + 可选操作。
- `ErrorState`：错误文案 + 重试按钮。
- 全局 Toast：轻提示，3 秒自动消失。

## 样式方案

- 设计变量：小红书布局 + 抖音配色。主色 `#FE2C55`，辅色 `#25F4EE`，背景 `#0F0F12`，卡片 `#1A1A1F`，圆角 12px。
- 移动优先：`< 768px` 双列，`>= 768px` 五列；底部 TabBar 在桌面端改为左侧导航。
- 字体使用系统字体栈，避免外部字体依赖。
- 所有可点击元素有 `:focus-visible` 样式，按钮有 `aria-label`。

## Mock 策略

- `VITE_USE_MOCK=true` 时，在 `main.tsx` 动态启动 MSW，**只在开发环境生效**。
- 演示登录验证码固定为 `123456`，页面会显示提示；该逻辑只存在于 mock，不影响真实后端。
- mock 数据严格按 `api/types.ts` 构造，覆盖：图文、视频、无封面、空列表、接口失败。
- `.env.example` 默认 `VITE_USE_MOCK=false`，保证默认连真实后端。
- 生产构建禁止把 MSW 打进主包（动态 import + `import.meta.env.DEV` 判断）。

## 错误处理

| 场景 | 行为 |
|---|---|
| 网络错误 | Toast“网络异常，请稍后重试”，保留页面 |
| `success=false` | 抛出 `ApiError(message, errorCode)`，展示后端 message |
| 401 / 未登录 | 清 token，跳登录并带 redirect |
| 403 | Toast“没有权限” |
| 404（笔记） | 显示“笔记不存在或已删除” |
| 上传失败 | 标记该文件失败，允许重试 |
| 图片加载失败 | 显示占位图 |
| 视频播放失败 | 显示错误层和重试按钮 |

## 测试策略

- 单元测试：
  - `client.ts`：鉴权头、`/api` 前缀、错误映射、401 清 token。
  - `useLike` / `useFollow`：乐观更新与失败回滚。
  - `NoteCard`：图文/视频分支、时长格式化、点赞数格式化（1.2w）。
  - `WaterfallGrid`：空态、骨架、加载更多。
- 组件测试：登录表单校验、验证码倒计时、发布表单校验。
- 集成测试：MSW 模拟登录 → feed → 详情 → 点赞。
- E2E（P1）：后端可用后，Playwright 跑主链路。

## 安全考量

- 全程不使用 `dangerouslySetInnerHTML`；正文按纯文本渲染。
- 不在控制台或错误上报中打印 token。
- token 存 `localStorage`，属于可接受风险；后续可迁移到 httpOnly cookie。
- 上传前校验 MIME 与大小，后端仍需二次校验。
- 外链统一 `rel="noopener noreferrer"`。
- 登录回跳只接受站内单斜杠路径，拒绝 `//`、反斜杠和控制字符，避免开放重定向。
- 依赖扫描：`react-router` 6 存在 2 个 moderate 告警（SSR hydration、开放重定向）。本项目是 SPA 且已加固回跳，暂不升级到 v7；升级列为后续任务。

## 后端就绪检查清单（联调前置）

按顺序验证，全部通过后才能关闭 T-009：

1. **网关路由**
   ```bash
   curl -X POST http://localhost:8000/note/detail \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"id":1001}'
   ```
   同样验证 `/user/findById`、`/relation/following/list`、`/file/upload` 不再 404。
2. **feed 列表**：`POST /note/feed` 返回 `pageNo/pageSize/totalCount/totalPage` 和卡片字段（`cover`、`creator`、`likeCount`、`liked`、`videoDuration`）。
3. **点赞**：`POST /note/like`、`POST /note/unlike` 后，`/note/detail` 的 `liked` 与 `likeCount` 同步变化。
4. **当前用户**：`POST /user/me` 返回 `{ id, nickName, avatar, introduction }`。
5. **关注状态**：`POST /relation/status` 返回 `{ following: boolean }`。
6. **上传**：`POST /file/upload` 返回可访问的文件 URL；网关已配置 `/file/**`。
7. **跨域**：开发期 Vite 代理可用；生产期 `/api` 同源反向代理可用。
8. **短信**：阿里云 AccessKey 改为环境变量并完成轮换；验证码发送失败时有日志可查。

字段命名必须保持 camelCase；时间字段按字符串透传即可。

## 影响分析与回滚

- 只新增 `frontend/` 目录，不改后端代码。
- 无数据库变更、无接口破坏性变更。
- 回滚：删除 `frontend/` 或回滚对应提交；通过 `VITE_API_BASE`、`VITE_USE_MOCK` 可快速切换环境。
