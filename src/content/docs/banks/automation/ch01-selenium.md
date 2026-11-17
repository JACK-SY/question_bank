---
title: 第 1 章 · Selenium 基础
description: Selenium 元素定位（含 XPath 与动态元素）、显式隐式等待、iframe 弹窗下拉框、JS 执行、PO 模式、脚本稳定性保障等自动化基础题，共 18 题
---

> **本章 18 题**：以 Selenium WebDriver（Python 绑定）为基准。PO 模式实操见学习板块《Selenium + Pytest PO 模式入门》，稳定性保障（Q18）是自动化岗面试压轴题。

### Q1.（单选 ★）下列哪一项**不属于** Selenium 提供的元素定位方式？

- A. `find_element(By.ID, ...)`
- B. `find_element(By.CSS_SELECTOR, ...)`
- C. `find_element(By.TAG_PATH, ...)`
- D. `find_element(By.XPATH, ...)`

> **答案**：C
> **解析**：Selenium 八大定位：**id、name、class name、tag name、link text、partial link text、CSS selector、XPath**。没有 TAG_PATH 这个 By。实战建议：有唯一 id 用 id；样式定位用 CSS；需要按文本或层级轴定位用 XPath。

### Q2.（单选 ★★★）关于显式等待与隐式等待，说法正确的是？

- A. `implicitly_wait(10)` 表示页面加载必须等待 10 秒
- B. 显式等待 `WebDriverWait(driver, 10).until(EC.visibility_of_element_located(...))` 针对特定条件生效，条件满足立即返回
- C. 隐式等待只能作用于单个元素
- D. 显式等待与隐式等待混用没有副作用

> **答案**：B
> **解析**：**隐式等待**：全局生效，找不到元素时在超时时间内轮询，找到即返回；**显式等待**：针对特定元素的特定条件（可见、可点击、文本出现等）。混用的坑：两者叠加会导致实际等待时间不可控（取较大者再叠加轮询间隔），团队规范通常**统一只用显式等待**。A 混淆了隐式等待和页面加载超时；C 隐式等待是 driver 级全局配置。

### Q3.（单选 ★）`driver.quit()` 与 `driver.close()` 的区别是？

- A. 完全相同
- B. `close()` 关闭当前窗口，`quit()` 关闭所有关联窗口并释放 driver 进程
- C. `quit()` 只关闭当前窗口，`close()` 关闭浏览器
- D. `close()` 会杀掉 chromedriver 进程

> **答案**：B
> **解析**：`close()` 关当前 tab，进程还在；`quit()` 销毁 session 并结束 chromedriver 进程。**用例 teardown 必须用 quit()**，否则残留进程会拖垮持续集成机。多窗口场景：`close()` + `switch_to.window(handle)` 配合使用。

### Q4.（简答 ★★）什么是 Page Object（PO）模式？它解决什么问题？

> **参考答案**：
> - PO 模式把**每个页面/组件封装为一个类**：页面元素定位与页面操作封装在 Page 类中，测试用例只表达业务步骤与断言。
> - **解决的问题**：定位器散落在用例里，UI 一改所有用例都要改——PO 把定位器收敛到页面类，页面变更只改一处。
> - 收益：用例可读性高（贴近业务）、定位与逻辑解耦、团队可并行维护。
> - 通常再配一层 BasePage（封装 find/click/wait/输入等原子操作）与数据层，形成三层结构。
>
> **解析**：一句话——"**页面怎么变是页面类的事，用例只关心业务流**"。追问点：PO 里不写断言（断言放测试层）。

### Q5.（单选 ★★）页面元素嵌在 iframe 中，定位不到时正确的处理是？

- A. 直接用 XPath 硬定位即可
- B. 先 `driver.switch_to.frame(iframe元素/索引/name)`，操作完 `driver.switch_to.default_content()` 切回主文档
- C. 使用 JavaScript 强制点击
- D. 增大隐式等待时间

> **答案**：B
> **解析**：iframe 是独立文档上下文，不切换直接定位必然 NoSuchElement。切回主文档用 `default_content()`，切回上一层用 `parent_frame()`。新版 Selenium 4 也支持 `driver.switch_to.frame(element)` 传 WebElement。A 报 NoSuchElementException，C 掩盖问题，D 无济于事——等待解决"没加载"，切换解决"不在当前文档"，两回事。

### Q6.（单选 ★★）浏览器原生 alert 弹窗，点击"取消"按钮应使用哪个 API？

- A. `driver.switch_to.alert.accept()`
- B. `driver.switch_to.alert.dismiss()`
- C. `driver.switch_to.alert.send_keys()`
- D. `alert.cancel()`

> **答案**：B
> **解析**：`accept()` = 确定，`dismiss()` = 取消，`send_keys()` 用于 prompt 输入框，`text` 获取弹窗文案。注意：alert 是 JS 原生弹窗，**必须先 switch_to.alert 切换**才能操作；页面自绘的 div 弹窗则按普通元素定位处理，别混。

### Q7.（简答 ★★）CSS 选择器与 XPath 定位各有什么优劣？

> **参考答案**：
> - **CSS**：语法简洁、执行快（浏览器原生查询），支持属性/子元素/兄弟选择器（`div.btn > span:nth-child(2)`）；缺点是不能向上查找、不支持按文本定位。
> - **XPath**：功能最强——支持文本匹配（`//a[text()='登录']`）、轴定位（`following-sibling::`、`ancestor::`）、函数（`contains()`、`starts-with()`），能定位几乎任何结构；缺点是语法长、性能略差、写法脆（依赖层级）。
> - **选型经验**：优先 id/CSS，文本与结构轴场景用 XPath；避免绝对路径 XPath（`/html/body/div[3]/...`），页面一改就碎。
>
> **解析**：追问点："文本含动态空格怎么办"——`normalize-space()`；"定位不到先查什么"——是否在 iframe/是否多窗口/是否加载中。

### Q8.（简答 ★★★）用例执行时抛出 `ElementClickInterceptedException`（点击被拦截），可能原因与排查思路是什么？

> **参考答案**：
> 1. **遮挡**：toast/loading 浮层、吸顶导航、遮罩罩住了目标元素——等浮层消失再点，或用 JS 滚动到目标。
> 2. **元素未就绪**：动画未完成、元素还在移动——显式等待 `element_to_be_clickable`。
> 3. **视口外**：元素在可视区域外被点击——`scrollIntoView({block:'center'})` 后再点。
> 4. **兜底手段**：对第三方控件/极端情况可用 JS 点击（`driver.execute_script('arguments[0].click()', el)`），但会绕过真实交互模拟，仅在排查清楚后使用。
> 5. **警惕误判**：有时是实际点了别的元素（定位器写错匹配到隐藏元素），先用浏览器 F12 验证定位唯一性。
>
> **解析**：这是自动化工程最常踩的坑之一，答题体现分层排查思路：先定位异常真实原因，再选等待/滚动/JS 兜底，最后回归"定位是否唯一"。

### Q9.（简答 ★★）Selenium 中如何定位一个元素？请举例说明常用的几种定位方法。

> **参考答案**：Selenium 共 **8 种定位**：ID、Name、ClassName、TagName、LinkText、PartialLinkText、XPath、CSS Selector。
> - **ID**：最优，唯一且稳定，优先使用（`find_element(By.ID, 'username')`）；
> - **LinkText / PartialLinkText**：仅适用于 `a` 标签，按链接文本精确/模糊匹配；
> - **CSS Selector**：执行速度快，浏览器原生查询，适合前端规范良好的页面（`By.CSS_SELECTOR, 'input[name="pwd"]'`）；
> - **XPath**：万能定位，支持文本、层级、轴、模糊匹配，元素无固定属性时的首选（`By.XPATH, '//button[text()="登录"]'`）。
>
> **解析**：与 Q7 对比记忆——Q7 考 CSS/XPath 优劣对比，本题考"全量列举 + 优先级排序"。答题顺口溜：**有 id 用 id，无 id 用 CSS，要文本/层级用 XPath，绝对路径禁用**。

### Q10.（简答 ★★）UI 自动化 3 种等待方式的区别与优点是什么？

> **参考答案**：
> 1. **强制等待 `sleep`**：固定休眠，简单但低效，页面快慢都要等满时间，不稳定，仅在特殊动画等场景临时使用；
> 2. **隐式等待 `implicitly_wait`**：全局设置一次，查找元素时轮询等待，只能判断元素是否存在，粒度粗，适合全局兜底；
> 3. **显式等待 `WebDriverWait`**：针对单个元素，支持可见、可点击、弹窗等多种条件（EC），效率最高、稳定性最强，是 UI 自动化标准方案。
>
> **最佳实践**：初始化时设置隐式等待兜底，业务操作全部使用显式等待，极少使用 sleep。
>
> **解析**：与 Q2 的单选互相印证。追问点："显式与隐式混用的坑"——两者叠加导致等待时间不可控，团队规范通常二选一（只用显式）。

### Q11.（简答 ★★）使用 Selenium 进行 Web 自动化测试时，如何判断一个页面上元素是否存在？

> **参考答案**：
> 1. `find_elements`（复数）获取元素列表，**列表长度 > 0 即存在**——不抛异常，最常用；
> 2. `try-except` 捕获 `NoSuchElementException`，无异常代表存在；
> 3. **显式等待配合 EC 条件**：`presence_of_element_located` 判断 DOM 中存在；`visibility_of_element_located` 判断元素页面可见。
>
> 业务操作前优先用 **visibility** 方式判断，防止元素存在但隐藏导致后续操作失败。
>
> **解析**：追问点："presence 与 visibility 的区别"——presence 只要求在 DOM 树里（可能 display:none），visibility 要求可见（宽高 > 0 且非 hidden）。

### Q12.（简答 ★★）什么是 Selenium Grid？适用什么场景？

> **参考答案**：
> - Selenium Grid 是**分布式远程自动化框架**，采用 **Hub-Node 架构**：Hub 负责接收测试请求并调度分发，Node 负责拉起浏览器实际执行测试。
> - **核心能力**：多浏览器/多版本并行（同一用例同时跑 Chrome/Firefox/Edge）、多操作系统分布执行、横向扩容提速。
> - **典型场景**：跨浏览器兼容性矩阵测试、大规模用例集并行执行缩短总时长、Docker 集群（selenium/grid:4 + K8s）承载 CI 回归。
>
> **解析**：追问点："Grid 与 pytest-xdist 的区别"——Grid 解决**异构环境**（不同浏览器/OS）的远程执行，xdist 解决**同环境多进程并行**，两者常组合使用。

### Q13.（简答 ★）XPath 中 "/" 和 "//" 的区别是什么？

> **参考答案**：
> 两者都是选取节点的路径表达式，区别在**查找范围**：
> 1. **"/"（单斜杠）**：从当前节点的**直接子节点**中选择，只匹配相邻一级，层级必须严格对应；
> 2. **"//"（双斜杠）**：从当前节点的**所有后代节点**中选择，可跨越多个层级，不限直接子级。
>
> 举例：
> - `/bookstore/book`：只选择 `<bookstore>` 元素的**直接** `<book>` 子元素；
> - `//book`：选择文档中**所有** `<book>` 元素，无论位于哪个层级。
>
> **解析**：落到 Selenium 定位实践：以 `/html/body/div/...` 下钻的**绝对路径**就是 "/" 逐级连写，页面结构一变即失效，禁止使用；日常首选相对定位如 `//input[@id='kw']`。注意 `//` 是全文档扫描，性能较差且易命中多个元素——需配合更精确的谓词（`[@id='x']`、`[last()]`、`[position()=1]`）收窄，或改用 `find_elements` 处理多匹配。追问点："`.` 与 `..` 的含义"——当前节点与父节点；"不以 `/` 开头的 XPath"——相对路径，从匹配上下文节点开始。

### Q14.（简答 ★）解释 XPath 的绝对路径和相对路径？

> **参考答案**：
> XPath 有两种主要路径表达式，区别在**从哪开始定位**：
> 1. **绝对路径**：从 XML/HTML 文档的**根节点**开始，按层级逐级向下定位，以单斜杠 `/` 开头。
>    例：`/html/body/div`——从根节点 `<html>` 出发，依次定位 `<body>` 下的 `<div>`，中间任何一级都必须严格匹配。
> 2. **相对路径**：**不从根节点开始**，从文档中的某个已知节点往下定位，通常以双斜杠 `//` 开头，更灵活，可直接跳到目标节点。
>    例：`//div[@id='content']`——在整个文档中查找所有 id 为 `content` 的 `<div>` 节点，无论其嵌套层级。
>
> **解析**：Selenium 定位实践——绝对路径与 DOM 结构强耦合，前端加一层包裹元素即失效，**禁用**；相对路径靠元素属性（`@id`、`@class`、`text()`）锚定，结构变化的容忍度高，是日常首选。追问点："相对路径一定比绝对路径慢吗"——`//` 需全文档扫描，单次执行略慢，但绝对路径的维护成本远高于这点性能差异，工程上一律选相对路径；"两者可否混用"——可以，如 `//div[@id='nav']/ul/li[2]`，前半段相对定位锚定容器、后半段逐级下钻。

### Q15.（简答 ★★）Selenium 如何处理下拉选择框（select）？

> **参考答案**：
> 标准原生 `<select>` 用 **Select 类**，先定位 select 元素再选 option：
>
> ```python
> from selenium.webdriver.support.ui import Select
>
> select = Select(driver.find_element(By.ID, "province"))
> select.select_by_value("js")            # 按 value 属性
> select.select_by_index(0)               # 按索引（从 0 开始）
> select.select_by_visible_text("江苏")    # 按显示文本（最稳定）
> ```
>
> - **多选下拉**：`select_by_*` 可连续追加选中，`deselect_all()` 清空全选；
> - **非 select 模拟的下拉**（div/ul/li 结构）：不能用 Select 类，按"**点击展开 → 显式等待选项出现 → 点击选项**"流程操作。
>
> **解析**：追问点："select_by_visible_text 和 select_by_value 哪个稳"——文本面向用户易被产品改文案，value 面向程序通常更稳定，视实际情况选；"选项加载慢怎么处理"——展开后对选项加显式等待再点击。

### Q16.（简答 ★★★）Selenium 中什么场景需要执行 JavaScript？如何执行？

> **参考答案**：
> 用 `driver.execute_script("js代码", 参数)` 执行同步 JS，典型场景：
> 1. **滚动到元素**：`arguments[0].scrollIntoView();`——页面底部元素普通 click 前先滚过去；
> 2. **点击被遮挡/隐藏元素**：`arguments[0].click()` 绕过覆盖层的遮挡拦截；
> 3. **富文本编辑器输入**：iframe 内的 contenteditable 元素 sendKeys 无效时，用 JS 直接写入 innerHTML；
> 4. **修改元素属性/取隐藏文本**：如移除 readonly、读取 `textContent`；
> 5. **触发页面级操作**：window.scrollTo 滚动到底部触发懒加载、返回页面状态（`return document.readyState`）。
>
> ```python
> driver.execute_script("arguments[0].click();", element)
> ready = driver.execute_script("return document.readyState")
> ```
>
> **解析**：追问点："execute_script 与 execute_async_script 的区别"——前者同步执行等待返回；后者执行异步 JS，靠手动调用 `callback` 结束（处理 setTimeout/回调类逻辑）；"JS 点击的隐患"——绕过了前端事件校验与遮挡逻辑，模拟不了真实用户交互，仅作兜底手段，优先排查"点不到"的真实原因。

### Q17.（简答 ★★）UI 自动化中如何处理动态元素定位？

> **参考答案**：
> "动态元素"指每次加载**属性值会变化**的元素（随机 id、动态拼接的 class、序号漂移）。处理思路按稳定性从高到低：
> 1. **换更稳定的锚点**：优先用不变的属性——语义化 name、`data-testid`、稳定的 class，避开随机生成的 id 和带动态哈希的 class（如 `css-1x2f3`）；
> 2. **XPath 函数模糊匹配**：
>    - `//input[contains(@id, 'username')]`——id 前缀固定、后缀随机；
>    - `//button[starts-with(@class, 'submit')]`——class 以固定串开头；
>    - `//a[text()='登录']`——文案稳定时按文本定位；
> 3. **CSS 属性选择器**：`input[id^='fixed-prefix']`、`[data-action='save']`，比 XPath 更快；
> 4. **相对结构定位（轴）**：从稳定元素出发找目标——`//label[text()='手机号']/following-sibling::input`，兄弟/父子关系比属性更抗变化；
> 5. **配合显式等待**：动态元素常伴随异步渲染，定位 + `WebDriverWait` 等到可见/可点击，避免把"没渲染完"误判为"定位失效"；
> 6. **规范倒逼**：推动前端给关键控件加 `data-testid`（测试专用稳定属性），一劳永逸。
>
> **解析**：核心原则是"**找不变量**"——属性、文本、相对关系三者中挑最稳的一个。追问点："contains 也不行（前后缀都变）怎么办"——用相邻稳定元素做锚点（parent/sibling 轴）或 JS 查找；"为什么绝对路径最怕动态页面"——中间插一个节点整条链就断。

### Q18.（简答 ★★★）自动化测试脚本的稳定性如何保障？

> **参考答案**：
> 按"**定位 → 等待 → 数据 → 失败处理 → 治理**"五层作答：
> 1. **定位稳定**：优先 id/稳定属性，禁用绝对路径；动态元素用模糊匹配与轴定位；PO 模式把定位器收敛到页面类，页面变更只改一处；
> 2. **等待策略**：业务操作全用**显式等待**（条件满足即通过），不用 sleep；按场景选对 EC 条件（存在/可见/可点击）；加载浮层、toast 先等消失再操作；
> 3. **用例数据与环境隔离**：用例自备数据、互不依赖、可重复执行（setup 建 data/teardown 清理）；独立测试账号防并发冲突；失败自动截图 + 保存日志/网络报文，保留"第一现场"；
> 4. **失败处理机制**：失败自动重跑（pytest-rerunfailures）区分偶发抖动与真 bug——但**重跑治标**，flaky 率要监控，超阈值必须根因分析（等待不足/数据污染/环境抖动）；
> 5. **持续治理**：统计 flaky 率并归因分类（脚本问题 / 真 bug / 环境问题）；定位器与用例定期维护；CI 分层（冒烟快速反馈、回归错峰跑），避免资源争抢造成假失败。
>
> **解析**：答题展示体系化："等待解决时机、PO 解决维护、数据隔离解决干扰、重跑解决抖动、治理解决根因"。追问点："重跑通过算不算 bug"——不算 bug 但算 flaky 债务，要记录归因持续消化；"稳定性优化先做哪件"——先消灭 sleep 和失败无截图，性价比最高。


