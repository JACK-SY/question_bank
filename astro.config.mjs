// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	base: '/docs',
	build: {
		assets: 'astro',
	},
	devToolbar: { enabled: false },
	integrations: [
		starlight({
			title: '测试题库',
			description: '软件测试工程师题库与学习内容',
			favicon: '/favicon.ico',
			components: {
				Head: './src/components/Head.astro',
				SiteTitle: './src/components/SiteTitle.astro',
				PageTitle: './src/components/PageTitle.astro',
				Sidebar: './src/components/Sidebar.astro',
				Header: './src/components/Header.astro',
			},
			customCss: ['./src/styles/custom.css'],
			// 单语言站点：内容直接放在 src/content/docs/ 根目录，无语言子目录。
			// defaultLocale: 'root' 是 Starlight 单语言非英文站点的标准写法。
			defaultLocale: 'root',
			locales: {
				root: {
					label: '简体中文',
					lang: 'zh-CN',
				},
			},
			// 侧栏两大板块：题库（一章一页，页内多题）+ 学习。
			// 注意：Sidebar.astro 顶部有按标题关键字过滤的搜索框，新增章节自动生效。
			sidebar: [
				{
					label: '题库首页',
					slug: 'index',
				},
				{
					label: '题库',
					items: [
						{
							label: '测试基础',
							items: [
								{ label: '第 1 章 · 测试基础概念', slug: 'banks/test-basics/ch01-fundamentals' },
								{ label: '第 2 章 · 测试用例设计', slug: 'banks/test-basics/ch02-case-design' },
								{ label: '第 3 章 · 缺陷管理', slug: 'banks/test-basics/ch03-defects' },
							],
						},
						{
							label: '自动化测试',
							items: [
								{ label: '第 1 章 · Selenium 基础', slug: 'banks/automation/ch01-selenium' },
								{ label: '第 2 章 · Pytest 框架', slug: 'banks/automation/ch02-pytest' },
								{ label: '第 3 章 · App 自动化（Appium）', slug: 'banks/automation/ch03-appium' },
							],
						},
						{
							label: '接口与性能',
							items: [
								{ label: '第 1 章 · 接口测试', slug: 'banks/api-perf/ch01-api' },
								{ label: '第 2 章 · 性能测试', slug: 'banks/api-perf/ch02-performance' },
							],
						},
						{
							label: 'Linux 与数据库',
							items: [{ label: '第 1 章 · Linux 与 SQL', slug: 'banks/linux-sql/ch01-linux-sql' }],
						},
						{
							label: 'Python 编程',
							items: [
								{ label: '第 1 章 · Python 语言基础', slug: 'banks/python-coding/ch01-basics' },
								{ label: '第 2 章 · 算法与编程题', slug: 'banks/python-coding/ch02-algorithms' },
							],
						},
					],
				},
				{
					label: '学习',
					items: [
						{
							label: '测试理论',
							items: [{ label: '用例设计方法实战指南', slug: 'learn/test-theory/case-design-guide' }],
						},
						{
							label: '工具实操',
							items: [{ label: 'Selenium + Pytest PO 模式入门', slug: 'learn/tools/selenium-pytest-pom' }],
						},
					],
				},
			],
		}),
	],
});
