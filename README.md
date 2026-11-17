# 测试题库（question-bank）

软件测试工程师题库 + 学习内容站点。基于 **Astro 6 + Starlight**，仅简体中文，纯 Markdown 阅读式（答案与解析直接可见，无交互组件）。

## 常用命令

```bash
npm install       # 安装依赖
npm run dev       # 开发服务器 http://localhost:4321/docs/
npm run build     # 构建产物到 ./dist/
npm run preview   # 本地预览构建产物 http://localhost:4321/docs/
```

> 站点挂载在 `/docs` 前缀下（`astro.config.mjs` 中 `base: '/docs'`）。

## 内容结构

```
src/content/docs/
├── index.md                    # 题库首页（板块导航）
├── banks/                      # 题库（一章一页，页内多题）
│   ├── test-basics/            # 测试基础：概念 / 用例设计 / 缺陷管理
│   ├── automation/             # 自动化测试：Selenium / Pytest / Appium
│   ├── api-perf/               # 接口与性能：接口测试 / 性能测试
│   ├── linux-sql/              # Linux 与数据库：常用命令 / SQL 基础
│   └── python-coding/          # Python 编程：语言基础 / 算法编程题
└── learn/                      # 学习内容
    ├── test-theory/            # 测试理论
    └── tools/                  # 工具实操
```

## 题目格式约定

每题一个三级标题，难度用 ★ 标注，答案与解析用引用块紧跟其后：

```markdown
### Q1.（单选 ★★）题干描述

- A. 选项一
- B. 选项二
- C. 选项三
- D. 选项四

> **答案**：B
>
> **解析**：一句话说清为什么。
```

## 新增一个章节

1. 在 `src/content/docs/banks/<板块>/` 下新建 `chNN-xxx.md`（frontmatter 必须含 `title`）；
2. 在 `astro.config.mjs` 的 `sidebar` 中对应分组下注册 `{ label, slug }`；
3. `npm run build` 验证通过后提交。

侧栏顶部自带关键字筛选框，新章节注册后自动生效。

## 样式与组件

- 主色 `#4E6FFF`，思源黑体，见 `src/styles/custom.css`；
- 覆盖组件位于 `src/components/`：`Head`（锁浅色主题）、`SiteTitle`（内联 SVG logo）、`PageTitle`（面包屑）、`Sidebar`(搜索筛选)、`Header`（站名 + 标语）。

## 版本

当前版本见 `package.json`（`npm version` 管理），分支沿用 `develop → master` 工作流，`npm run build` 通过方可合并。
