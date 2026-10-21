# 小红书风格内容社区前端 — 复盘记录

## 状态

- 前端实现：✅ T-001 ~ T-008 完成
- 本地质量门禁：✅ 通过
- 真实联调：⏸ blocked（等待后端 B-001 ~ B-004）
- 日期：2026-10-21

## 做得好的

- 先定接口契约和 mock，再写页面，后端未就绪时也能完整演示主链路。
- 全程 TDD：每个任务先写失败测试，再实现，共 17 个测试文件、60 个测试用例。
- mock 只在开发环境启用，生产构建已确认不包含 MSW 代码。
- 点赞/关注采用乐观更新，失败自动回滚，交互反馈快。
- 登录回跳限定站内路径，避免开放重定向。

## 可以改进的

- 后端一直无法本地启动，真实接口只做了契约层面对齐，缺少端到端验证。
- 移动端 375px 与桌面 1440px 只做了 CSS 约束，没有自动化视觉回归。
- hls.js 的 m3u8 播放只验证了组件分支，没有真实流地址联调。
- `npm audit` 默认镜像不支持安全审计，改用 npmjs 源后才发现 React Router 告警。

## 技术决策记录

- **React + TanStack Query + CSS Modules**：服务端状态交给 Query，样式保持可控，不引入组件库。
- **Vite 5 + Vitest 2**：Vite 6 与 Vitest 2 存在 Vite 类型冲突，降级到兼容组合。
- **MSW 仅开发环境**：通过 `import.meta.env.DEV` + `VITE_USE_MOCK` 双重判断，生产构建移除。
- **只做验证码登录**：后端新用户注册不写密码，密码登录暂不可用；验证码倒计时对齐后端 3 分钟限制。
- **发布成功回首页**：后端 `/note/publish` 不返回笔记 ID，第一版不做详情跳转。
- **React Router 6 暂不升级**：中危告警主要影响 SSR；本项目是 SPA，且已加固回跳。升级 v7 列为后续项。

## 遗留项

| 优先级 | 事项 | 说明 |
|---|---|---|
| P0 | B-001 网关路由修复 | 去掉 note/user/relation 的 `StripPrefix=1`，增加 `/file/**` 路由 |
| P0 | B-002 feed 与点赞接口 | `/note/feed`、`/note/like`、`/note/unlike`、`/note/liked/status` |
| P0 | B-003 当前用户与关注状态 | `/user/me`、`/relation/status` |
| P0 | B-004 跨域/同源代理 | 开发代理与生产 nginx 方案 |
| P1 | 他人主页与搜索 | 需要新增用户笔记列表接口 |
| P1 | 密码登录 | 需要用户设置密码的产品流程 |
| P1 | Playwright E2E | 后端就绪后覆盖登录→刷→点赞→发布→我的 |
| P1 | React Router v7 升级 | 修复 2 个 moderate 告警 |
| P2 | token 改 httpOnly cookie | 降低 XSS 窃取风险 |
| P2 | 真实 m3u8 与响应式视觉回归 | 当前仅做组件级验证 |

## 测试记录

- 测试文件：17
- 测试用例：60
- 覆盖重点：API 客户端、登录态、feed 分页、点赞/关注乐观更新与回滚、上传、发布、个人页、mock 契约。
- 命令：`npm run lint`、`npm run typecheck`、`npm test`、`npm run build`。
