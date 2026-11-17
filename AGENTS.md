# AGENTS.md

本文件为 AI 协作（Codex / CodeBuddy 等）提供本仓库的工作指引。

## 项目概览

**测试题库** — 软件测试工程师题库 + 学习内容站点，基于 **Astro 6 + Starlight 0.38**。单语言（仅简体中文），内容为一章一页的纯 Markdown 题库。

## 命令

```bash
npm install       # 安装依赖
npm run dev       # 开发服务器（http://localhost:4321/docs/）
npm run build     # 生产构建到 ./dist/（合并前必须通过）
npm run preview   # 预览构建产物
```

项目无测试套件；`npm run build` 通过即是唯一质量门禁。

## 关键约束

- **仅简体中文**：内容直接放 `src/content/docs/` 根目录（无语言子目录）。Starlight 配置为 `defaultLocale: 'root'` + `locales.root.lang = 'zh-CN'`。
- **base 为 `/docs`**：所有内部链接、重定向必须考虑此前缀。
- **一章一页**：一个 `.md` = 一个章节，内含多题；不做 MDX 组件、不加 JS 交互。
- **纯 Markdown**：答案/解析直接可见（引用块），不隐藏、不折叠。

## 架构

- `src/content.config.ts` — 单一 `docs` 集合，Starlight `docsLoader()` + `docsSchema()`。
- `src/content/docs/` — 全部内容：
  - `index.md` 首页
  - `banks/` 题库（test-basics / automation / api-perf 三板块）
  - `learn/` 学习（test-theory / tools 两板块）
- `src/components/` — 5 个 Starlight 覆盖组件：
  - `Head.astro`（锁浅色主题）、`SiteTitle.astro`（内联 SVG）、`PageTitle.astro`（面包屑，`homeLabel='首页'`）、`Sidebar.astro`（搜索筛选，已去 `nav.ts` 依赖，直接渲染 `sidebar` prop）、`Header.astro`（站名 + 标语）。
- `src/styles/custom.css` — 主色 `#4E6FFF`、思源黑体、隐藏主题切换。

## 新增题目 / 章节流程

1. 在 `src/content/docs/banks/<板块>/chNN-主题.md` 新建文件，frontmatter 含 `title`；
2. 题目格式：`### Qx.（单选 ★★）题干` + 选项列表 + `> **答案**：… > **解析**：…`；
3. 在 `astro.config.mjs` 的 `sidebar` 数组注册 `{ label, slug }`（slug 不含 `.md`，不带 `/docs` 前缀）；
4. `npm run build` 通过后提交。

**注意**：`Sidebar.astro` 与 `astro.config.mjs` 的 sidebar 配置是联动部件，改侧栏必须同步检查两者。

## 提交规范

- commit 消息用中文，如 `feat: 新增接口测试章节`；
- 分支工作流：`develop`（集成）→ `master`（生产）；
- 每阶段一次提交，build 通过才提交。
