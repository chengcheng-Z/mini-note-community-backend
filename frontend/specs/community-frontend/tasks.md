# 小红书风格内容社区前端 — Tasks

状态图例：`pending` / `in_progress` / `completed` / `blocked`

## 后端前置任务（用户负责）

| ID | 任务 | DoD | 风险 | 依赖 | 状态 |
|---|---|---|---|---|---|
| B-001 | 修复网关路由 | `/note/**`、`/user/**`、`/relation/**` 经网关可访问对应控制器；`/file/**` 可访问 OSS；冒烟脚本通过 | 去掉 `StripPrefix=1` 可能影响其他调用方 | 无 | pending |
| B-002 | 补齐 feed 与点赞接口 | `/note/feed`、`/note/like`、`/note/unlike`、`/note/liked/status` 按 `design.md` 契约返回 | 字段不一致导致前端返工 | B-001 | pending |
| B-003 | 补齐当前用户与关注状态接口 | `/user/me`、`/relation/status` 可用，返回结构符合契约 | 登录态获取方式差异 | B-001 | pending |
| B-004 | 解决跨域或同源代理 | 浏览器从 `http://localhost:5173` 能请求网关；或提供 nginx 代理方案 | 生产环境跨域配置遗漏 | B-001 | pending |

## 前端任务

| ID | 任务 | DoD | 风险 | 依赖 | 优先级 | 状态 |
|---|---|---|---|---|---|---|
| T-001 | 搭建项目骨架 | Vite + React + TS 可启动；路由 `/`、`/login`、`/note/:id`、`/publish`、`/profile` 可访问；React Query 与全局样式就绪；`npm run typecheck` 通过 | 依赖版本冲突 | B-001（仅联调需要） | P0 | completed |
| T-002 | 前端 API 客户端与契约类型 | `client.ts` 带 `/api` 前缀与 `Authorization: Bearer`；统一解包 `Response`；401 清 token 跳登录；`types.ts` 与 `design.md` 完全一致；单元测试通过 | 后端字段变更 | T-001 | P0 | completed |
| T-003 | 登录注册与登录态 | 只做手机号验证码登录（自动注册）；180 秒倒计时；token 持久化；刷新保持登录；退出清空；未登录回跳；组件测试通过 | 短信服务未就绪、`/user/me` 未补 | T-002 | P0 | completed |
| T-004 | Mock 与测试基建 | MSW 覆盖 feed/detail/login/like/follow/upload；`VITE_USE_MOCK=true` 生效；生产构建不包含默认 mock；`npm run test` 通过 | mock 与真实契约漂移 | T-002 | P0 | completed |
| T-005 | 首页瀑布流 | 双列/五列响应式；骨架、空态、错误重试；触底加载下一页；卡片含封面、时长角标、作者、点赞数；视频卡片可见时静音预览；单测覆盖 | 长列表性能 | T-004 | P0 | completed |
| T-006 | 笔记详情与互动 | 图文轮播、视频播放（mp4/m3u8）；作者信息与关注状态；点赞/关注乐观更新与失败回滚；返回恢复滚动位置；单测覆盖 | 视频格式与跨域 | T-005 | P0 | completed |
| T-007 | 发布笔记 | 图文多选/视频单选；上传进度与失败重试；大小/类型校验；发布成功回首页刷新；失败保留表单；组件测试通过 | OSS 未就绪 | T-006 | P1 | completed |
| T-008 | 我的页面 | 展示 `/user/me`；我的笔记/关注/粉丝三个 tab；退出登录；空态与错误态；单测覆盖 | 分页接口字段差异 | T-006 | P1 | completed |
| T-009 | 联调与质量门禁 | `VITE_USE_MOCK=false` 下主链路冒烟通过；`lint`、`typecheck`、`test`、`build` 全绿；375px/1440px 无横向滚动 | 后端未就绪导致阻塞 | B-002、B-003、B-004、T-007、T-008 | P0 | blocked |

## 执行规则

- 每个任务按 TDD：先写失败测试（RED）→ 最小实现（GREEN）→ 重构（REFACTOR）→ 全量回归。
- 每完成一个任务，更新本文件状态，并运行 `lint + typecheck + test`。
- 涉及真实接口的验收必须在 `VITE_USE_MOCK=false` 下完成。
- 未获得明确授权前不创建 commit、不推送、不创建 PR。

> T-009 说明：本地质量门禁（58 个测试、lint、typecheck、build）已通过；真实联调仍等待 B-001 ~ B-004 完成，因此保持 `blocked`。
