---
title: 第 2 章 · Pytest 框架
description: Pytest fixture 作用域与 yield、conftest、参数化与数据驱动、命令行参数、mark、xunit 前后置（setup/setup_class）、报告定时自动推送、xdist 并行、monkeypatch、插件生态与框架分层设计题，共 35 题
---

> **本章 35 题**：以 pytest 8.x 为基准；fixture 实操代码见学习板块《Selenium + Pytest PO 模式入门》，框架分层设计题（Q32）是测开面试压轴题。

### Q1.（单选 ★★★）pytest fixture 的四种作用域，从小到大及默认值是？

- A. function < class < module < session，默认 module
- B. function < class < module < session，默认 function
- C. session < module < class < function，默认 function
- D. function < module < class < session，默认 class

> **答案**：B
> **解析**：`@pytest.fixture(scope=...)` 四档：**function（默认）< class < module < session**。执行顺序规则：**大 scope 的 fixture 先建立、后销毁**——同一次运行中 session 级最先 setup、最后 teardown。同 scope 多个 fixture 按声明顺序与依赖关系执行，被依赖的先执行。

### Q2.（单选 ★★）conftest.py 的作用是什么？

- A. 存放项目配置参数，替代 pytest.ini
- B. 集中定义 fixture，同目录及其子目录下的用例自动可用，无需 import
- C. 存放测试数据文件
- D. 配置 pytest 插件加载

> **答案**：B
> **解析**：conftest.py 是 pytest 的**局部插件与 fixture 共享层**：在目录 A 放 conftest.py，A 及其所有子目录的测试都能直接使用其中的 fixture（依赖注入按名称匹配）。可分层嵌套：根目录放全局 driver fixture，子目录放该模块专属 fixture，就近覆盖。注意：conftest.py 文件名固定、不能被显式 import。

### Q3.（单选 ★★）对同一个登录函数 login(user, pwd, expected) 做 20 组数据校验，最合适的方式是？

- A. 写 20 个测试函数
- B. 在一个循环里执行 20 次断言
- C. `@pytest.mark.parametrize('user,pwd,expected', data_list)` 参数化
- D. 用 for 循环生成 20 个文件再收集

> **答案**：C
> **解析**：参数化让每组数据独立成一条用例：**独立执行、独立报告、互不影响**，某组失败不影响其他组。B 的大坑：循环内第一次断言失败整个用例就停了，后面数据没被执行。追问点：多组参数可叠加（多个 parametrize 装饰器做笛卡尔积），数据量大时配合 `ids` 给用例命名。

### Q4.（单选 ★★）yield 型 fixture 中，yield 之后的代码什么时候执行？

- A. 只有断言全部通过才执行
- B. 用例结束后执行，作为 teardown；即使用例断言失败也会执行
- C. 永远不执行
- D. 在用例执行前执行

> **答案**：B
> **解析**：yield 前是 setup、yield 是"把资源交给用例"、yield 后是 teardown——**等价于 try/finally 的 finally**，用例挂了也执行清理（关浏览器、回滚数据）。对比：老式 `setup_function/teardown_function` 函数对逐渐被 fixture 取代，fixture 支持依赖注入与作用域控制，是 pytest 的核心优势。

### Q5.（多选 ★）关于用例跳过与预期失败，正确的是？

- A. `@pytest.mark.skip(reason='...')` 无条件跳过
- B. `@pytest.mark.skipif(sys.version_info < (3, 9), reason='...')` 条件跳过
- C. `@pytest.mark.xfail` 表示预期失败，失败不算错，意外通过会标记 XPASS
- D. 被跳过的用例会计入失败

> **答案**：ABC
> **解析**：skip/skipif/xfail 三件套是版本兼容与已知问题管理的基本盘。D 错——跳过用例报告为 **skipped**，不计入 failed。xfail 的 strict 模式（`@pytest.mark.xfail(strict=True)`）下 XPASS 会按失败处理，用于"该修了"的提醒。

### Q6.（单选 ★）pytest 的断言写法是？

- A. `self.assertEqual(a, b)`
- B. `assert a == b`，失败时 pytest 自动展示两侧值与表达式细节
- C. `pytest.assert.equals(a, b)`
- D. 必须配合第三方断言库

> **答案**：B
> **解析**：pytest 用**原生 assert + 断言重写（assertion rewriting）**：失败时自动展开中间表达式（如展示 dict 的 diff）。A 是 unittest 风格。高频追问："assert a in b 失败显示什么"——会显示 a、b 的实际值；pytest 6+ 还内置 `approx` 做浮点比较。

### Q7.（单选 ★★）`@pytest.fixture(autouse=True)` 的效果是？

- A. 该 fixture 只能被显式传参使用
- B. 其作用域内的所有用例自动应用该 fixture，无需在用例签名中声明
- C. 只对标记的用例生效
- D. 与 scope 冲突，不能同时设置

> **答案**：B
> **解析**：autouse 适合**全局前置动作**：每个用例前清理缓存、注入日志、mock 时间等。注意别滥用——autouse 会隐藏依赖关系，团队规范通常要求：跨模块公共动作进 conftest + autouse，业务前置显式声明。

### Q8.（简答 ★★）相比 unittest，pytest 有哪些优势？

> **参考答案**：
> 1. **写法轻量**：普通函数即用例，无需类与 self，断言用原生 assert。
> 2. **fixture 体系**：依赖注入式的前后置管理，支持作用域、嵌套、参数化，远强于 unittest 的 setup/teardown。
> 3. **参数化**：`parametrize` 一行实现数据驱动。
> 4. **插件生态**：pytest-xdist（并行）、pytest-html/allure（报告）、pytest-rerunfailures（失败重跑）、pytest-ordering（排序）等即插即用。
> 5. **兼容性**：可直接运行 unittest 风格用例，便于存量迁移。
>
> **解析**：答题后可补一句工程实践："并行跑用例时注意 fixture 的 scope 与全局状态的线程安全，session 级 driver 配 xdist 要按 worker 分配。"

### Q9.（简答 ★★）你用过哪些装饰器？请结合自动化测试场景说明。

> **参考答案**：
> - **`@pytest.mark.parametrize`**：参数化测试，一组测试逻辑传多组数据跑多条用例。场景：接口多组入参（正常值/边界值/异常值）、UI 输入不同账号与查询条件。
> - **`@pytest.mark.skip`**：直接跳过当前用例。场景：功能未开发完临时屏蔽、依赖服务未部署。
> - **`@pytest.mark.skipif`**：条件跳过，满足条件才跳过。场景：仅 Linux 环境执行、指定版本才运行。
> - **自定义重试装饰器 `@retry`**：用例失败自动重试 N 次并间隔等待，区分真正 bug 与偶现不稳定用例（flaky case）。场景：页面加载慢元素偶尔找不到、接口偶发网络波动。
> - **`@classmethod`**：类方法，第一个参数 `cls`，只能访问类属性。场景：封装接口通用配置、统一域名、全局请求头。
> - **`@staticmethod`**：静态方法，无 self/cls。场景：工具类内通用计算、数据格式化、简单校验。
> - **`@pytest.fixture`**：夹具，实现测试前置/后置/依赖注入。场景：初始化与关闭浏览器、获取登录 token、数据库连接。
> - **`@app.route`**：Flask 路由注册，把 URL 与视图函数绑定。场景：搭建 Mock 服务模拟下游依赖。
>
> **解析**：这题考知识广度，答题策略是"pytest 系 + Python 系各说几个，每个带一句使用场景"。追问点：`@wraps` 的作用（保留被装饰函数的 `__name__`/`__doc__`，防止装饰器签名丢失）。

### Q10.（简答 ★★）fixture 中 yield 前后代码的执行时机？用例失败会影响它吗？

> **参考答案**：
> - **yield 前 = 前置（setup）**：在每条依赖该 fixture 的用例**执行之前**运行（如启动浏览器、准备数据）；
> - **yield 后 = 后置（teardown）**：在用例**执行之后**运行（如关闭浏览器、清理数据）；
> - **用例失败不影响后置**：即使用例断言失败或抛异常，yield 之后的清理代码仍会执行（保证环境复原）。
>
> ```python
> @pytest.fixture
> def browser():
>     driver = webdriver.Chrome()   # 前置
>     yield driver                  # 把资源交给用例
>     driver.quit()                 # 后置，必执行
> ```
>
> **解析**：这等价于 unittest 的 setUp/tearDown，但 fixture 还能参数化、跨文件共享、多级作用域。追问点："teardown 里要区别对待失败用例怎么办"——`request.node` 判断用例结果（如失败自动截图）；"yield 和 addfinalizer 谁更稳"——后者注册即执行，teardown 部分代码多时更安全。

### Q11.（简答 ★★）pytest 怎么让失败的用例自动重跑？想"第一条失败就停"用什么参数？

> **参考答案**：
> - **失败自动重跑**：插件 `pytest-rerunfailures`——`pytest --reruns 3 --reruns-delay 2`（最多重跑 3 次、间隔 2 秒），也可用 `@pytest.mark.flaky(reruns=3)` 标记单条用例；
> - **快速失败**：`pytest -x`（第一条失败立即停止）、`--maxfail=2`（累计 2 条失败停止）；
> - 场景：CI 冒烟阶段用 `-x` 快速暴露首要问题；网络波动导致的 flaky 用例用 reruns 区分"偶发抖动"与"真 bug"。
>
> **解析**：追问点："重跑机制能滥用吗"——不能，重跑治标不治本：flaky 率应监控，超阈值必须根因分析（等待不足、数据污染、环境问题），无脑加重跑会掩盖真实缺陷。

### Q12.（简答 ★★）pytest 中 skip 和 xfail 的区别？自定义 mark 标记怎么消除 warning？

> **参考答案**：
> - **skip**：直接**不执行**，无条件跳过（`@pytest.mark.skip` / 条件式 `skipif`）；
> - **xfail**：**执行但预期失败**——失败则标记 XFAIL（符合预期算通过），意外成功标记 XPASS；`@pytest.mark.xfail(strict=True)` 时"意外通过"会被判为失败，提醒你移除该标记；
> - **自定义 mark 注册**：在 `pytest.ini` / `pyproject.toml` 的 `markers` 列表里注册（如 `markers = ["smoke: 冒烟用例"]`），否则用例执行时抛 `PytestUnknownMarkWarning`；
> - 用法：`pytest -m smoke` 只跑冒烟集，实现用例分层。
>
> **解析**：追问点："xfail 什么时候用"——已知缺陷未修复（bug 单挂着）、新功能占位用例，先写进集合并明确"当前预期就是失败"，缺陷修复后自然转绿。

### Q13.（简答 ★★★）conftest.py 的作用是什么？fixture 的查找规则是怎样的？

> **参考答案**：
> **conftest.py 是 pytest 的目录级共享配置文件**，存放 fixture 与 hook，目录内测试文件**无需 import 即可使用**其中 fixture：
> 1. **查找规则**：pytest 从用例所在目录向上逐级收集 conftest，**就近优先**——子目录与父目录定义同名 fixture 时，子目录覆盖父目录；
> 2. **分层组织**（推荐）：
>    - 项目根 `conftest.py`：全局资源——浏览器 driver、登录态、数据库连接；
>    - 模块目录 `conftest.py`：该模块专属 fixture（如 orders 模块的订单前置数据）；
> 3. **作用域配合**：全局登录态用 `session` 级只登录一次，页面级资源用 `function`。
>
> 典型结构：`conftest.py 提供 fixture → 用例函数以参数名直接注入`，实现**依赖注入**，用例代码只写业务。
>
> **解析**：追问点："conftest 里能写用例吗"——能写但不会被收集执行（文件名不符合 test_ 规则），conftest 只承担 fixture/hook；"跨项目共享 fixture"——插件化封装成 pip 包，`pytest_plugins` 引入。

### Q14.（简答 ★★）说几个 pytest 常用的命令行参数及作用。

> **参考答案**：
> - `pytest -v`：详细模式（显示每条用例名与结果）；`-q`：安静模式（只显示进度摘要）；
> - `pytest -s`：显示 print 输出（默认被捕获）——调试用例时必加；
> - `pytest -k "login"`：按**用例名关键字**筛选执行（模糊匹配）；
> - `pytest -m smoke`：按**标记**执行（只跑冒烟集）；
> - `pytest file.py::test_func::param`：精确到**类/函数/参数化实例**执行；
> - `pytest --collect-only`：只列出将被收集的用例不执行（核对用例数）；
> - `pytest -x / --maxfail=N`：快速失败；`--lf`（last-failed）只重跑上次失败的用例；
> - `pytest -n 4`（xdist）：4 进程并行。
>
> **解析**：高频组合：日常调试 `-v -s`，回归按层 `-m`，失败分析 `--lf`。追问点："-s 的原理"——关闭输出捕获（capture=no）；"`--collect-only` 什么场景用"——CI 里核对用例收集数量，防止用例文件命名错误导致"跑了个寂寞"。

### Q15.（简答 ★★）pytest 与 unittest 的主要区别有哪些？（为什么项目普遍迁移到 pytest）

> **参考答案**：
> 1. **用例编写**：pytest 用普通 `assert` 断言（失败时自动展示表达式与上下文值）；unittest 必须用 `self.assertEqual` 等 30+ 个断言方法；
> 2. **前置/后置**：pytest 的 **fixture 支持多级作用域、参数化、按名注入、跨文件共享（conftest）**；unittest 是 setup/teardown 固定层级，复用与组合能力弱；
> 3. **参数化**：pytest 原生 `@pytest.mark.parametrize` 一行实现数据驱动；unittest 要借助 subTest 或第三方 ddt；
> 4. **用例发现**：pytest 兼容收集 unittest 用例（可平滑迁移）；用例必须是 `Test` 开头类 / `test_` 开头函数，无强制继承；
> 5. **生态**：pytest 插件体系庞大（xdist/allure/xdist/rerunfailures/mock），unittest 几乎无生态。
>
> **解析**：一句话总结——**pytest 写得少、跑得快、生态强**。追问点："pytest 能跑 unittest 用例吗"——能，向后兼容，迁移可以渐进式；"assert 重写是什么"——pytest 收集时改写字节码，把 assert 表达式拆解出中间值用于失败报告。

### Q16.（简答 ★★★）如何实现数据驱动的参数化？数据放 YAML/JSON 文件里怎么读？

> **参考答案**：
> **思路：数据与脚本分离**——用例数据放 YAML/JSON，用例加载后传给 `parametrize`：
>
> ```python
> # login_data.yaml
> - [ "user1", "pwd1", True ]
> - [ "user2", "error", False ]
>
> # test_login.py
> import yaml, pytest
>
> def load_data(path):
>     with open(path, encoding="utf-8") as f:
>         return yaml.safe_load(f)
>
> @pytest.mark.parametrize("username, password, expected", load_data("login_data.yaml"))
> def test_login(username, password, expected):
>     result = login(username, password)
>     assert result == expected
> ```
>
> 进阶：封装成装饰器 `@data("login_data.yaml")` 统一处理文件读取 + 字段映射，用例只写业务逻辑。**数据驱动的好处**：新增用例只改数据文件，脚手架零改动。
>
> **解析**：追问点："YAML 与 JSON 选哪个"——YAML 支持注释、写法更紧凑，团队维护友好；"一条数据失败会影响其他数据吗"——parametrize 每组数据是独立用例，互不影响（相比循环内断言，失败即停）。

### Q17.（简答 ★★★）fixture 如何参数化（params）？每组参数会执行几条用例？

> **参考答案**：
> fixture 通过 `params` 实现多环境/多配置驱动——**每个参数值都会触发一次依赖它的用例执行**：
>
> ```python
> @pytest.fixture(params=["chrome", "firefox", "edge"], ids=["chrome", "ff", "edge"])
> def browser(request):
>     driver = get_driver(request.param)   # request.param 取当前参数值
>     yield driver
>     driver.quit()
>
> def test_search(browser):
>     browser.get("https://x.com")         # 会跑 3 次：每个浏览器一条
> ```
>
> - **执行次数 = 参数个数 × 依赖用例数**（上例 test_search 执行 3 次）；
> - `ids` 自定义每组参数的显示名，报告可读性更好；
> - 典型场景：**跨浏览器兼容测试**、多环境配置（dev/staging）跑同一套用例。
>
> **解析**：追问点："parametrize 和 fixture params 怎么选"——parametrize 驱动"用例数据"，fixture params 驱动"运行环境/资源"；"request 是什么"——pytest 内置 fixture，访问当前请求上下文（param/config/session）。

### Q18.（简答 ★★）fixture 的 autouse 有什么用？有什么风险？

> **参考答案**：
> `@pytest.fixture(autouse=True)`：**同作用域内所有用例自动应用**，无需显式传参声明：
> - **适用场景**：全局性横切逻辑——每条用例前清理测试数据、注入公共日志、跳过条件检查（按环境自动跳过）；
> - **风险**：**隐式依赖不可见**——用例看似无依赖实际执行了前置，新人读代码不知道"哪来的前置"；且作用域内所有用例都承担该开销；
> - **纪律**：能显式声明就不 autouse；必须用时要写清注释说明影响范围。
>
> ```python
> @pytest.fixture(autouse=True)
> def clean_test_data():
>     yield
>     delete_test_records()   # 每条用例后自动清理
> ```
>
> **解析**：追问点："autouse 的作用范围"——定义在 conftest 则该目录树下全部生效，定义在模块内只对该文件生效；"什么情况必须用"——所有用例无差别需要的清理/初始化，逐个传参太啰嗦时。

### Q19.（简答 ★★★）fixture 之间可以互相调用吗？说说依赖注入的执行顺序。

> **参考答案**：
> **fixture 可以把其他 fixture 作为参数**，形成依赖链，pytest 自动按依赖顺序解析：
>
> ```python
> @pytest.fixture(scope="session")
> def db_conn():
>     conn = create_connection()
>     yield conn
>     conn.close()
>
> @pytest.fixture
> def logged_in_user(db_conn):          # 依赖 db_conn
>     user = login(db_conn)
>     yield user
>     logout(user)
>
> def test_order(logged_in_user):       # 用例只声明最终依赖
>     assert logged_in_user.is_valid()
> ```
>
> **执行顺序**：按依赖图**先执行最底层**（db_conn setup → logged_in_user setup → 用例 → logged_in_user teardown → db_conn teardown），**后进先出**（栈式清理）。
>
> **解析**：追问点："循环依赖会怎样"——pytest 报错（fixture dependency loop）；"作用域不同怎么组合"——session 级可被 function 级依赖（大的套小的），**反过来会报 ScopeMismatch**（function 级不能注入 session 级用例所需——准确说低作用域 fixture 不能被高作用域 fixture 依赖）。

### Q20.（简答 ★★）unittest 的 setUp/tearDown 与 pytest fixture 有什么区别？

> **参考答案**：
> 1. **显式 vs 隐式**：xunit 风格（setup/teardown）在类内**自动执行**（隐式）；fixture **按名注入**（显式声明依赖），可读性与可组合性更好；
> 2. **作用域**：unittest 只有 setup/tearDown（每用例）与 setUpClass/tearDownClass（类级）、setUpModule（模块级）；pytest fixture 提供 **function/class/module/package/session 五级**；
> 3. **参数化**：unittest 前置无法参数化；fixture 支持 `params` 一套前置跑多份；
> 4. **共享**：unittest 需写基类继承；fixture 放 conftest.py 全目录共享，无需继承；
> 5. **命名**：unittest 方法名固定（setUp），fixture 可任意命名（语义化，如 `browser`、`admin_user`）。
>
> **解析**：pytest 同时保留两套机制，但工程实践推荐 fixture。追问点："setup_class 和 fixture 谁先执行"——类级 xunit 钩子先于类内 function 级 fixture 执行；"yield fixture 可以替代 tearDownClass 吗"——用 `scope="class"` 的 fixture 即可。

### Q21.（简答 ★★）pytest 结果里的 Error（error）和 Failed（failure）有什么区别？

> **参考答案**：
> - **Failed（断言失败）**：用例**跑起来了**，但断言不通过——代码逻辑或被测功能的 bug；
> - **Error（报错）**：用例**没跑完/没跑起来**——setup 阶段异常、fixture 抛错、import 失败、元素找不到抛 WebDriverException 等**非断言异常**；
> - **排查方向不同**：Failed 先查被测功能与预期值；Error 先查测试代码与环境（fixture、依赖服务、数据准备）。
>
> CI 治理：Error 通常意味着**框架/环境问题**，占比应远低于 Failed；Error 突然增多优先排查环境变更。
>
> **解析**：追问点："fixture 里断言失败算 error 还是 failed"——setup 阶段的异常计为 error（用例未执行）；"error 能自动重跑吗"——rerunfailures 对两者都可重试，但 error 应先修环境而非无脑重试。

### Q22.（简答 ★★）pytest 的 assert 断言为什么失败时会显示变量的实际值？

> **参考答案**：
> **pytest 的断言重写（assertion rewriting）机制**：收集用例时，pytest 把 `assert` 语句**改写为等价代码并保留中间表达式的求值结果**，失败时报告能展示"每个子表达式的实际值"：
>
> ```python
> assert result.status == "success" and len(result.items) > 0
> # 失败输出：
> # assert 'fail' == 'success'   ← 直接看到两侧实际值
> #  +  where 'fail' = <Result>.status
> ```
>
> - 这是 pytest 对 `assert` 语句做的 AST 级改写（unittest 的 assertEqual 做不到这种自解释输出）；
> - 注意：**自定义断言帮助函数写在 conftest 外的普通模块时**，若在断言中调用复杂函数，失败信息只有最终布尔值——把比较写在 assert 表达式内可获得详细报告。
>
> **解析**：追问点："如何关闭断言改写"——`--assert=plain`（几乎不用）；"断言带说明"——`assert a == b, f"响应错误: {a}"`，消息会在失败时一并显示。

### Q23.（简答 ★★）pytest.ini 里通常配置哪些内容？

> **参考答案**：
> ```ini
> [pytest]
> # 用例搜索路径（rootdir 下额外目录）
> testpaths = tests
> # 收集规则：类/函数命名模式
> python_classes = Test*
> python_functions = test_*
> # 注册自定义 mark（消除 warning + 文档化）
> markers =
>     smoke: 冒烟用例集
>     slow: 耗时用例
> # 默认命令行参数（CI 与本地行为统一）
> addopts = -v --strict-markers --tb=short
> # 日志级别
> log_cli = true
> log_cli_level = INFO
> ```
>
> - **addopts** 是最实用项：把团队约定（如 `--strict-markers` 严查未注册 mark）固化，避免每人本地行为不一致；
> - 同级可选 `pytest.ini` / `pyproject.toml [tool.pytest.ini_options]` / `tox.ini`，优先级 pytest.ini 最高（存在即作为 rootdir 标志）。
>
> **解析**：追问点："--strict-markers 的作用"——用到未注册的 mark 直接报错（而不是 warning），保证 `-m` 筛选拼写错误不会"静默跑空"；"配置文件对 rootdir 的影响"——pytest 以它为根目录解析相对路径。

### Q24.（简答 ★★★）pytest-xdist 是怎么实现并行的？并行时要注意哪些坑？

> **参考答案**：
> **原理**：`pytest -n 4` 启动 4 个**独立 worker 进程**，主进程把用例**分发**（默认按执行时长均衡分发）给各 worker，各自跑完汇总——**进程级并行**（绕开 GIL，可利用多核）。
> - **注意事项（坑）**：
>   1. **用例相互独立是前提**——共享文件、固定端口、同账号登录会互相干扰（数据竞争），必须先隔离（独立测试账号、临时目录 tmp_path）；
>   2. **session 级 fixture**：每个 worker 各执行一次（不是全局一次），数据准备类 fixture 要幂等或用文件锁；
>   3. **执行顺序不可预期**：依赖执行顺序的用例（先创建后查询）必须改为 fixture 依赖或合并用例；
>   4. 输出交错：报告用 `--junitxml`/allure 汇总而非看控制台。
> - **收益评估**：IO 密集（UI/接口）收益大；用例本身有全局锁资源时并行反而更慢。
>
> **解析**：追问点："和 selenium-grid 并行的区别"——xdist 是**同机多进程**（提速），grid 是**异构环境远程执行**（多浏览器），常组合；"-n auto 是什么"——按 CPU 核数自动定 worker 数。

### Q25.（简答 ★★）Allure 报告相比 pytest-html 有什么优势？常用注解有哪些？

> **参考答案**：
> **pytest-html**：单文件 HTML，轻量但只有"用例名 + 结果 + 失败片段"。**Allure**：结构化测试报告平台——**步骤、附件、分层、趋势**：
> - **常用装饰器**：
>   - `@allure.epic / @allure.feature / @allure.story`：需求/模块/功能三层归类（对应测试用例管理体系）；
>   - `@allure.title("自定义标题")` / `@allure.severity(SeverityLevel.BLOCKER)`：用例标题与优先级；
>   - `@allure.step("打开登录页")`：方法/代码块级步骤；
>   - `@allure.attach(数据)`：附加截图、日志、请求响应 JSON；
> - **失败自动截图**（UI 用例）：在 fixture teardown 中判断用例失败后 `allure.attach(driver.get_screenshot_as_png())`；
> - 生成：`pytest --alluredir=result` → `allure serve result` 查看。
>
> **解析**：追问点："报告里能看到接口请求详情吗"——在请求封装层用 `allure.attach` 把 URL/入参/响应写进去；"allure 的历史趋势"——配合 CI 归档 history 目录可展示通过率趋势。

### Q26.（简答 ★★★）pytest 的 monkeypatch 是什么？测试中怎么用它？

> **参考答案**：
> **monkeypatch 是 pytest 内置 fixture，用于在测试期间临时替换（mock）对象属性/环境变量**，用例结束自动还原：
>
> ```python
> def test_discount(monkeypatch):
>     # 1. 替换函数：让时间固定，测试"限时优惠"逻辑
>     monkeypatch.setattr("app.utils.get_now", lambda: datetime(2026, 11, 11))
>     # 2. 替换环境变量
>     monkeypatch.setenv("PAY_TIMEOUT", "30")
>     # 3. 替换第三方方法返回值
>     monkeypatch.setattr(orders, "query_rate", lambda x: 0.9)
>     assert calc_price(100) == 90
> ```
>
> - **核心价值**：隔离不可控因素——外部接口、当前时间、随机数、文件系统，让用例**确定性可重复**；
> - **作用域自动恢复**：用例结束后 monkeypatch 自动还原所有修改，不留副作用。
>
> **解析**：追问点："monkeypatch 与 unittest.mock 的区别"——monkeypatch 是 pytest 原生更轻量（直接 setattr/getattr/delitem），unittest.mock 功能更全（MagicMock、call 断言）；"替换后异常场景怎么测"——setattr 成抛异常的函数，验证容错分支。

### Q27.（简答 ★★）pytest-mock 的 mocker fixture 与 monkeypatch 有什么区别？

> **参考答案**：
> `pytest-mock` 插件提供 **mocker fixture**，本质是 `unittest.mock` 的 pytest 风格封装：
> - `mocker.patch('module.func', return_value=1)`：patch 后**自动还原**（与 monkeypatch 一样无残留）；
> - **比 monkeypatch 强在 mock 断言**：`mock_func.assert_called_once_with(x)` 验证"被调用过、参数正确"——这是行为验证，monkeypatch 只能改不能查；
> - 支持 `MagicMock`、`side_effect`（抛异常/序列返回值）、`mocker.spy`（包裹真实函数记录调用）。
>
> 选型：**改行为用 monkeypatch 足够；要"验证调用"（是否调用/调用参数）用 mocker**——接口测试中验证"重试逻辑调用了几次下游"是典型场景。
>
> **解析**：追问点："spy 和 patch 的区别"——spy 保留真实实现只记录调用，patch 完全替换；"side_effect 干什么用"——每次调用依次取值或抛异常，模拟连续不同响应/超时。

### Q28.（简答 ★★★）如何给 pytest 添加自定义命令行参数（如 --env 切换环境）？

> **参考答案**：
> 用 **hook 函数**在 conftest.py 中扩展：
>
> ```python
> # conftest.py
> def pytest_addoption(parser):
>     parser.addoption("--env", action="store", default="test",
>                      help="运行环境: test / staging / prod镜像")
>
> @pytest.fixture(scope="session")
> def base_url(request):
>     return ENV_CONF[request.config.getoption("--env")]
> ```
>
> 运行：`pytest --env=staging`——**用例通过注入 base_url fixture 获取环境配置**，用例本身零改动。
>
> 这是"**测试框架环境参数化**"的标准做法：配置文件（YAML）管理各环境数据，命令行只传环境名，CI 流水线按需切换。
>
> **解析**：追问点："不用 addoption 能实现吗"——读环境变量 `os.getenv("ENV")` 也可以，但自定义参数类型安全、有 --help 文档；"多环境配置怎么组织"——conf 目录按环境分 YAML，fixture 按参数加载。

### Q29.（简答 ★★）pytest 怎么只跑指定模块/类的用例？收集规则是什么？

> **参考答案**：
> - **运行方式**：`pytest test_login.py`（文件）、`pytest test_login.py::TestLogin`（类）、`pytest test_login.py::TestLogin::test_ok`（函数）、`::test_ok[case1]`（参数化实例）；
> - **默认收集规则**：
>   1. 文件名 `test_*.py` 或 `*_test.py`；
>   2. 类名 `Test*` 开头且**无 `__init__` 方法**；
>   3. 方法/函数 `test_` 开头；
> 4. 可在 pytest.ini 用 `python_files / python_classes / python_functions` 自定义。
>
> 常见坑：类里定义了 `__init__` 会**不被收集**；用例文件被 conftest 语法错误连累也无法收集。
>
> **解析**：追问点："如何只收集不执行"——`--collect-only` 核对用例清单；"pytest 怎么排序执行"——默认按文件-类-函数定义顺序，可用 `pytest-ordering`/`pytest-order` 插件或依赖式设计避免顺序耦合。

### Q30.（简答 ★★★）"登录 → 下单 → 支付"这样的流程用例，pytest 里怎么组织？怎么解决用例间依赖？

> **参考答案**：
> 原则：**用例之间不相互依赖，公共前置放 fixture**——
> 1. **标准做法**：把"登录"做成 fixture（返回 token/已登录的 client），流程中每个接口独立成用例，各自依赖登录 fixture：
>
> ```python
> @pytest.fixture
> def logged_in_token(base_url):
>     return login(base_url, "user", "pwd")["token"]
>
> def test_create_order(base_url, logged_in_token): ...
> def test_query_order(base_url, logged_in_token): ...
> ```
>
> 2. **确实要验证"串行流程"**（下单→支付→查状态的业务链）：用 `pytest-dependency` 插件（`@pytest.mark.dependency(depends=["test_create_order"])`）声明依赖，失败自动跳过下游；
> 3. **不要**用"全局变量传中间结果 + 固定执行顺序"实现——并行（xdist）下顺序不可控，全盘崩溃。
>
> **解析**：追问点："依赖用例失败下游怎么办"——dependency 模式下游 skip（结果里不算失败）；"为什么反对用例间共享状态"——耦合导致无法单独执行、无法并行、失败定位困难。

### Q31.（简答 ★★）pytest-repeat / pytest-dependency 这些插件你用过吗？说说 pytest 插件生态。

> **参考答案**：
> 按"解决什么问题"组织插件清单：
> - **执行控制**：`pytest-xdist`（并行）、`pytest-repeat`（重复执行 N 次，查偶现问题）、`pytest-ordering`/`pytest-dependency`（顺序与依赖）、`pytest-randomly`（随机顺序暴露顺序耦合）；
> - **稳定性**：`pytest-rerunfailures`（失败重跑）、`pytest-timeout`（超时控制防挂死）；
> - **报告**：`pytest-html`、`allure-pytest`、`pytest-cov`（覆盖率）；
> - **辅助**：`pytest-mock`（mock）、`pytest-assume`（多断言不中断，软断言）、`pytest-parallel`。
>
> 安装即用是 pytest 插件体系的优点（entry point 自动注册），**但插件叠加要控制**——行为互相干扰（如 randomly 与 ordering 冲突）。
>
> **解析**：追问点："pytest-assume 的场景"——一条用例要校验响应里 5 个字段且希望全部结果都报出来（assert 第一个失败就中断）；"怎么找插件"——PyPI 搜 pytest- 前缀，官方文档有精选列表。

### Q32.（简答 ★★★）用 pytest 从零搭建一套接口自动化框架，你的分层设计是什么？

> **参考答案**：
> **五层结构**（每层只依赖下一层）：
> ```
> api_project/
> ├── conf/          # 环境配置（test/staging YAML + --env 切换）
> ├── common/        # 通用封装：request_client(重试/日志/签名)、assert_util、db_util
> ├── api/           # 接口对象层：每个业务域一个类（LoginApi/OrderApi），封装 URL+入参构造
> ├── data/          # 测试数据（YAML 用例数据 + 造数脚本）
> ├── conftest.py    # 全局 fixture：base_url、session(token)、db_conn
> └── testcases/     # 用例层：只写"调用 + 业务断言"，零底层代码
> ```
> - **用例层原则**：一条用例 = 一组数据 + 一次调用 + 一组断言，出现"两行以上重复代码"就下沉到 api 层；
> - **配套机制**：parametrize 数据驱动、mark 分层（smoke/regression）、allure 报告、失败自动重跑、CI 触发（提交后跑冒烟、每晚跑回归）；
> - **接口依赖**：上游返回用 JSON Extractor 思路封装成 fixture（登录态 session 级共享）。
>
> **解析**：答题展示"**分层解耦**"思想（对比 PO 模式的接口版）。追问点："为什么用例层不直接写 requests.post"——URL/域名/签名散落各处，改一处动全身；封装后环境切换与统一重试只改一层。

### Q33.（简答 ★★）pytest 收集到的用例数比预期少/多，怎么排查？

> **参考答案**：
> 先 `pytest --collect-only` 看实际收集清单，再按规则排查：
> - **少了**：
>   1. 文件/类/函数命名不符合收集规则（`login.py`、`tests_login.py`、类有 `__init__`）；
>   2. 被 `collect_ignore` / `--ignore` 排除；
>   3. 文件 import 时抛异常（收集即失败，看 error 报告）；
>   4. `testpaths` 限定后目录不包含目标文件；
> - **多了**：
>   1. conftest/test 文件**被重复导入路径命中**（不同 sys.path 两次导入）；
>   2. 测试目录里有历史遗留的 `test_*.py` 副本/备份文件；
>   3. fixture/helper 函数命名意外以 `test_` 开头。
>
> **解析**：追问点："怎么确认某条用例为什么没跑"——`pytest --collect-only -k 用例名` 直接查；"同名用例文件在不同目录会冲突吗"——会（模块名冲突），需在各测试目录加 `__init__.py` 或启用 `--import-mode=importlib`。

### Q34.（简答 ★★）setup 和 setup_class 的区别？

> **参考答案**：
> 这是 xunit 风格前后置的**执行级别**差异：
> 1. **setup（setup_method）**：**每个用例前各执行一次**——用例级隔离，如每条用例前重置页面状态、清理 cookie；
> 2. **setup_class**：**整个类只执行一次**，在类内第一条用例之前——类级共享资源，如启动一次浏览器、建立一次连接；对应 `teardown_class` 在类内最后清理；
> 3. **完整五级（从大到小）**：`setup_module` → `setup_class` → `setup_method`（即 setup）→ 用例 → teardown 按镜像逆序执行；
> 4. **与 fixture 的关系**：xunit 前后置隐式自动执行、不可参数化、不能跨文件共享；fixture 按名注入 + 五级作用域 + conftest 共享，工程上推荐 fixture——但读老代码、迁移 unittest 项目必须懂 xunit。
>
> ```python
> class TestLogin:
>     @classmethod
>     def setup_class(cls):
>         cls.driver = webdriver.Chrome()      # 类级：整个类只启动一次
>
>     def setup_method(self, method):           # 用例级：每条用例前执行
>         self.driver.get("https://x.com/login")
>
>     def teardown_method(self, method):
>         self.driver.delete_all_cookies()
> ```
>
> **解析**：一句话——"**setup 每条用例一次，setup_class 每类一次**"。追问点："pytest 里的写法名"——`setup_method/teardown_method`（unittest 风格的 `setUp/tearDown` pytest 也兼容识别）；"类级资源在用例失败后会清理吗"——会，`teardown_class` 不受单条用例失败影响，与 fixture yield 后置同理。

### Q35.（简答 ★★）测试报告会定期自动发出来吗？如何实现？

> **参考答案**：
> 会——标准做法是 **CI 定时任务触发执行 → 报告生成 → 自动推送**三步：
> 1. **定时触发**：CI（Jenkins/GitLab CI）配 cron 定时任务，如每晚 22:00 跑回归 `pytest -m regression`；代码提交则触发冒烟，两级节奏分离；
> 2. **报告生成**：`pytest --alluredir=result` 产出 Allure 数据，CI 集成 allure 生成在线报告（有历史趋势）；轻量场景用 pytest-html 单文件；
> 3. **自动推送**：
>    - **邮件**：Jenkins Email Extension 按构建结果发送（可选"仅失败才发"）；
>    - **IM 群机器人**：钉钉/飞书/企业微信 webhook，脚本解析 pytest 结果后推送摘要（总数/通过率/失败用例名 + 报告链接）；
> 4. **推送内容设计**：摘要先行——通过率、失败清单、与上一轮的对比（新增失败 vs 历史失败）；失败才 @ 责任人，避免"报告疲劳"；
> 5. **闭环**：失败用例自动登记缺陷单/指派认领，形成"定时跑 → 自动报 → 有人跟"的闭环。
>
> **解析**：这题实际考**持续集成意识**，答题要点是"定时跑 + 结果摘要 + 失败高亮"。追问点："天天全量推送没人看怎么办"——分层推送：冒烟结果即时推、回归摘要每日一报、仅失败 @ 人；"为什么报告要挂在 CI 而不是本地跑"——环境一致、每次构建有归档与趋势，结果可追溯。



