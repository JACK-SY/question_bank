---
title: 第 1 章 · Python 语言基础
description: 深浅拷贝、列表去重、args/kwargs、推导式、join 拼接、类方法体系、异常、with 原理、dict 底层、单例、作用域、内存管理、垃圾回收、字典与 JSON、大文件处理、排序与造数等 Python 基础题，共 27 题
---

> **本章 27 题**：测试工程师面试高频 Python 语言基础，GIL、单例、with 原理、内存管理与垃圾回收是测开岗加频题。

### Q1.（简答 ★★）请描述一下深拷贝和浅拷贝的区别。

> **参考答案**：
> - **浅拷贝**：只拷贝**第一层**数据；内部嵌套对象/数组时，新对象与原对象**共用内层引用**。
>   - 第一层是基本类型：完全独立，修改互不影响；
>   - 第二层是引用类型（嵌套对象）：新旧指向同一内存，修改内层数据两边一起变。
>   - Python 浅拷贝方式：`copy.copy()`、列表切片 `lst[:]`、`list()`、`dict()`。
>
> ```python
> import copy
> a = [10, 20, [30, 40]]
> b = copy.copy(a)      # 浅拷贝
> b[0] = 99              # 改第一层基本类型，a 不受影响
> b[2][0] = 999          # 改嵌套引用对象，a 同步变化
> print(a)  # [10, 20, [999, 40]]
> print(b)  # [99, 20, [999, 40]]
> ```
>
> - **深拷贝**：递归拷贝**所有层级**数据，嵌套对象也开辟全新内存，新对象与原对象完全隔离；修改任意一层（含嵌套内层），原对象完全不受影响。实现：`copy.deepcopy()`。
>
> ```python
> b = copy.deepcopy(a)   # 深拷贝
> b[2][0] = 999
> print(a)  # [10, 20, [30, 40]] 原数据不变
> ```
>
> - **本质区别**：是否独立拷贝嵌套的引用对象。浅拷贝性能高；深拷贝完全隔离但开销更大。
>
> **解析**：追问点："赋值 `b = a` 算浅拷贝吗"——不算，赋值只是引用同一对象；"什么场景必须深拷贝"——测试数据工厂里共享模板数据派生新用例数据时。

### Q2.（简答 ★）列表和元组的区别是什么？

> **参考答案**：
> - **符号**：列表 `[]` **可变**，元组 `()` **不可变**；
> - **操作**：列表支持 `append` / `pop` / `insert` 等修改；元组只能查询；
> - **性能**：元组内存更小、创建与访问更快；
> - **哈希**：元组可做字典 key / 集合元素，列表不行；
> - **选型**：经常改动用列表，固定不变数据（配置、常量序列）用元组。
>
> **解析**：追问点："只有一个元素的元组怎么写"——`(1,)`，逗号不可省；"可变元组"——元组内嵌 list 时 list 内容可改（元组存的是引用）。

### Q3.（简答 ★）is 和 == 的区别是什么？

> **参考答案**：
> - `==`：判断两个变量的**值是否相等**（调用 `__eq__`）；
> - `is`：判断两个变量是否为**同一个内存对象**（比较 id 地址）。
>
> ```python
> a = [1, 2, 3]
> b = [1, 2, 3]
> a == b   # True  —— 值相等
> a is b   # False —— 两个不同对象
> ```
>
> **解析**：追问点："小整数缓存"——`-5 ~ 256` 的 int 有对象缓存池，`a = 100; b = 100` 时 `a is b` 为 True，属解释器优化，不能当业务依据；判空惯用 `is None`。

### Q4.（简答 ★★）什么是 Python 中的鸭子类型？

> **参考答案**：
> - 源自格言："**如果它走起路来像鸭子，叫起来像鸭子，那么它就是鸭子**。"
> - 指程序设计中**关注对象的行为（方法和属性）而不是对象的类型**：只要对象实现了所需的方法，就可以当作目标类型使用，无需显式继承。
> - 经典例子：Python 的迭代器——只要对象实现了 `__iter__()` 和 `__next__()` 方法，它就可被视为迭代器，即使它没有继承任何迭代器类。
>
> **解析**：追问点："与 Java 静态类型的多态有何不同"——Java 靠继承/接口声明建立类型关系，Python 鸭子类型靠方法签名"事实上满足"；对测试的价值：Mock 对象能替换真实依赖正是靠鸭子类型。

### Q5.（简答 ★★）迭代器和生成器（yield）的区别是什么？

> **参考答案**：
> - **从属关系**：生成器是特殊的迭代器——所有生成器都是迭代器，迭代器不全是生成器。
> - **实现方式**：
>   - 自定义迭代器：手写类，实现 `__iter__`、`__next__`，手动维护状态；
>   - 生成器：函数使用 `yield`，Python 自动实现迭代协议、自动保存上下文。
> - **运行特点**：生成器执行到 `yield` 暂停，再次 `next()` 从暂停位置继续执行。
> - **选型**：
>   - ✅ 优先用生成器（yield）：简单序列、数据流、读取大文件、爬虫分批获取数据，追求代码简洁；
>   - ✅ 用类迭代器：逻辑复杂、需封装多个方法、迭代过程需外部控制、状态管理复杂的场景。
>
> **解析**：追问点："生成器省什么"——惰性求值，不用一次把全量数据装进内存，处理大文件/大结果集时内存占用是常量级。

### Q6.（简答 ★★）什么是多态？

> **参考答案**：
> - **多态**：同一个方法调用，不同对象产生不同行为。
> - **实现的三个前提**：
>   1. 存在继承关系（子类继承父类）；
>   2. 子类重写（override）父类方法；
>   3. 通过父类类型的引用调用该方法。
>
> ```python
> class Animal:
>     def speak(self):
>         print("动物发出声音")
>
> class Dog(Animal):
>     def speak(self):
>         print("汪汪汪")
>
> class Cat(Animal):
>     def speak(self):
>         print("喵喵喵")
>
> def make_sound(animal: Animal):   # 接收父类，传入任意子类
>     animal.speak()
>
> make_sound(Dog())  # 汪汪汪
> make_sound(Cat())  # 喵喵喵 —— 同样调用 speak，不同对象行为不同
> ```
>
> **解析**：结合测试场景的加分答：自动化框架里 Web/iOS/Android 三端 Page 对象实现同名 `get_page_title()`，用例层面向基类编程即是多态思想。

### Q7.（简答 ★）重载和重写的区别是什么？

> **参考答案**：
> - **重写（override）**：子类重新实现父类的同名方法，是实现多态的方式（Python 常用）；
> - **重载（overload）**：同一个类内方法名相同、参数列表不同（**Python 不支持方法重载**，同名后定义覆盖前定义；需要"重载"效果时用默认参数或 `*args` 实现）。
>
> **解析**：追问点："Python 怎么模拟重载"——`def f(a, b=None, *args)` 默认参数 + 可变参数，或 `functools.singledispatch` 按类型分发。

### Q8.（简答 ★★★）什么是 GIL？它对 Python 多线程有什么影响？

> **参考答案**：
> **GIL（Global Interpreter Lock，全局解释器锁）**：CPython 解释器中的一把全局锁，保证**同一时刻只有一个线程执行 Python 字节码**。
> - **CPU 密集型任务**：多线程无法利用多核，甚至因锁竞争比单线程更慢——应使用**多进程**（`multiprocessing`）绕开 GIL；
> - **IO 密集型任务**：线程等待网络/磁盘时会**释放 GIL**，多线程依然有效（爬虫、批量接口请求、文件处理）；
> - 其他方案：`concurrent.futures`（按任务类型选 ThreadPoolExecutor / ProcessPoolExecutor）、`asyncio` 协程（高并发 IO）。
>
> 测试场景：批量执行接口请求用**线程池**（IO 密集）；批量生成大数据/图像处理用**进程池**。
>
> **解析**：追问点："GIL 是语言特性还是 CPython 实现细节"——实现细节（Jython/IronPython 无 GIL）；"多线程一定比多进程快吗"——看任务类型，IO 密集多线程轻量高效，CPU 密集才需多进程。

### Q9.（简答 ★★★）可变类型作为函数默认参数会有什么坑？如何规避？

> **参考答案**：
> **默认参数在函数定义时只求值一次**，之后所有调用**共享同一个对象**——可变类型（list/dict）会被跨调用修改：
>
> ```python
> def add_case(name, tags=[]):        # 坑：所有调用共享同一个列表
>     tags.append(name)
>     return tags
>
> add_case("A")   # ['A']
> add_case("B")   # ['A', 'B']  ← 上次调用残留了！
> ```
>
> **规避方式**：默认值用不可变的 `None`，函数体内再创建新对象：
>
> ```python
> def add_case(name, tags=None):
>     if tags is None:
>         tags = []
>     tags.append(name)
>     return tags
> ```
>
> **解析**：坑的根源是"**定义时绑定**而非调用时求值"。追问点："不可变默认值安全吗"——str/int/tuple 安全（不可变，改不了）；这个坑在封装测试工具函数（默认收集结果列表、默认共享 session 对象）时极易踩中。

### Q10.（简答 ★★）Python 中列表去重有哪几种方法？各自注意什么？

> **参考答案**：
> 1. **set()**：`list(set(lst))`——最快，但**不保证顺序**（数值列表通常有序，混合类型无序）；
> 2. **dict.fromkeys()**：`list(dict.fromkeys(lst))`——**去重且保持原顺序**（Python 3.7+ dict 有序），首选；
> 3. **列表推导式 + 辅助集合**：
>
> ```python
> seen = set()
> unique = [x for x in lst if not (x in seen or seen.add(x))]
> ```
>
> 4. **元素是 dict/list（不可哈希）**：不能直接用 set——转元组/JSON 字符串后再去重，或逐个比较。
>
> 测试场景：合并多个来源的用例数据后去重、对比接口返回列表与预期列表的元素差异。
>
> **解析**：追问点："为什么 set 会乱序"——set 是哈希表，顺序取决于哈希值；"两个列表求差集"——`set(a) - set(b)`（注意重复元素与顺序，严谨对比用 collections.Counter）。

### Q11.（简答 ★★）*args 和 **kwargs 的作用是什么？

> **参考答案**：
> - `*args`：接收**多余的位置参数**，打包成 tuple；
> - `**kwargs`：接收**多余的关键字参数**，打包成 dict；
> - 顺序固定：`def f(普通参数, *args, 关键字参数, **kwargs)`；
> - **反向使用（解包）**：调用时 `f(*list)` 把序列拆成位置参数、`f(**dict)` 把字典拆成关键字参数。
>
> ```python
> def req(method, url, *args, **kwargs):     # 透传参数给 requests
>     return session.request(method, url, *args, **kwargs)
> req("POST", "/login", json={...}, timeout=5)
> ```
>
> 测试场景：**封装请求客户端**（签名、日志统一加，业务参数原样透传）、装饰器转发参数。
>
> **解析**：追问点："args/kwargs 名字必须这样吗"——不必，`*`/`**` 才是语法，名字任意；"关键字参数强制命名"——`def f(*, key)` 仅限关键字参数（kwargs 之前的 `*` 分隔）。

### Q12.（简答 ★★）lambda 表达式与 map/filter 怎么用？

> **参考答案**：
> - `lambda 参数: 表达式`：匿名函数，**只能写一个表达式**，适合"一行小逻辑"；
> - `map(f, seq)`：对每个元素应用 f，返回惰性 map 对象（`list()` 展开）；
> - `filter(f, seq)`：保留 f 返回 True 的元素；
> - 实际代码更常用**列表推导式**替代（可读性好）：
>
> ```python
> ids = list(map(lambda u: u["id"], users))          # 取字段
> actives = [u for u in users if u["active"]]         # filter 推导式写法
> pairs = [(name, uid) for uid, name in zip(uids, names)]
> ```
>
> 测试场景：从接口返回的用户列表提取字段做断言、把 CSV 读出的字符串列表批量转数值。
>
> **解析**：追问点："lambda 和 def 的区别"——仅语法区别（匿名/单表达式），复杂逻辑必须 def；"map 返回什么"——Python 3 是迭代器（省内存），直接打印是对象地址。

### Q13.（简答 ★★）列表推导式和普通 for 循环的区别？什么情况不该用推导式？

> **参考答案**：
> ```python
> # 普通循环
> result = []
> for u in users:
>     if u["score"] >= 60:
>         result.append(u["name"])
> # 等价推导式（更快、更紧凑，底层做了优化）
> result = [u["name"] for u in users if u["score"] >= 60]
> # 带条件表达式（if-else 放前面）
> labels = ["及格" if s >= 60 else "不及格" for s in scores]
> # 字典推导式
> id_map = {u["id"]: u["name"] for u in users}
> ```
> - **不该用的场景**：逻辑超过两层嵌套/两行（可读性崩坏）、有副作用（循环里还 print/写库）、需要 try/except——退回普通循环；
> - **内存**：推导式一次性建列表；数据量大用**生成器表达式** `(x for x in ...)` 逐个产出。
>
> **解析**：追问点："推导式性能为什么略好"——append 方法的属性查找被优化掉；"嵌套推导式怎么读"——从左到右即 for 从外到内。

### Q14.（简答 ★★）拼接大量字符串应该用什么？为什么？

> **参考答案**：
> **`"".join(list)`**：
>
> ```python
> parts = []
> for line in big_file:
>     parts.append(process(line))
> result = "".join(parts)          # 正确：先收集，一次性拼接
> ```
>
> - **`str += str` 在循环中是 O(n²)**：字符串不可变，每次 `+=` 都创建新串并复制旧内容，n 次循环总复制量平方级增长；
> - `join` 先算总长度一次性分配内存，**O(n)**；
> - f-string：少量、已知的几段拼接用它最直观（`f"{host}/api/{path}"`）。
>
> 测试场景：拼装大批量报文、拼 SQL/日志时用 join；固定模板用 f-string。
>
> **解析**：追问点："join 只能接字符串吗"——列表元素必须全是 str，数字先 `map(str, lst)`；"f-string 和 format 谁快"——f-string 编译期处理更快。

### Q15.（简答 ★★）实例方法、类方法、静态方法的区别？

> **参考答案**：
> 1. **实例方法**：第一个参数 `self`，可访问实例属性与类属性——操作具体对象状态；
> 2. **类方法 `@classmethod`**：第一个参数 `cls`，只能访问类级属性——**常用作替代构造器**（`User.from_dict(d)`）；
> 3. **静态方法 `@staticmethod`**：无 self/cls，只是"住在类命名空间里的普通函数"——与类相关但不依赖实例/类的纯工具（签名算法、格式校验）。
>
> ```python
> class TestCase:
>     def run(self): ...                    # 实例方法
>     @classmethod
>     def from_yaml(cls, path): ...         # 替代构造器
>     @staticmethod
>     def valid_name(name): return name.startswith("test_")
> ```
>
> 测试场景：工具类里"通用校验"放 staticmethod，"从配置创建 driver"放 classmethod。
>
> **解析**：追问点："classmethod 最大的用途"——工厂方法/多构造入口，继承时 cls 自动指向子类；"静态方法为什么不直接写成模块函数"——归属与组织（逻辑上属于这个类）。

### Q16.（简答 ★★）Python 的异常处理机制？怎么自定义异常？

> **参考答案**：
> ```python
> class ApiError(Exception):
>     def __init__(self, code, message):
>         super().__init__(f"[{code}] {message}")
>         self.code = code
>
> try:
>     resp = api_call()
> except ApiError as e:          # 捕获自定义
>     log.error(f"接口异常 code={e.code}")
>     raise                       # 处理不了就抛出，别吞
> except (TimeoutError, ConnectionError) as e:
>     retry()
> else:
>     parse(resp)                 # 无异常才执行
> finally:
>     clean_up()                  # 一定执行
> ```
> - **异常匹配自上而下**，子类异常放前面；裸 `except:` 禁止（会吞 KeyboardInterrupt）；
> - **自定义异常**：继承 Exception，带业务字段（code/msg），让"接口异常、断言异常、环境异常"可分类捕获——框架必备；
> -  finally 保证清理（释放连接）。
>
> **解析**：追问点："为什么不能 except Exception: pass"——吞掉错误让问题静默失真（测试框架里比报错更可怕）；"raise 和 raise e 的区别"——`raise` 保留原始 traceback。

### Q17.（简答 ★★★）with 语句的原理是什么？怎么自定义支持 with 的类？

> **参考答案**：
> **with = 上下文管理协议**：进入时调 `__enter__`，无论块内是否异常，退出时必调 `__exit__`（相当于"自动化的 try/finally"）：
>
> ```python
> class DBConn:
>     def __enter__(self):
>         self.conn = create_conn()
>         return self.conn            # as 变量接收
>     def __exit__(self, exc_type, exc_val, tb):
>         self.conn.close()           # 异常也保证关闭
>         return False                # True 则吞掉异常，一般 False
>
> with DBConn() as conn:
>     conn.query(...)
> ```
>
> - 测试场景：数据库连接、文件操作、浏览器 driver 封装——**保证资源必释放**，避免用例失败后环境残留；
> - 更简洁的写法：`contextlib.contextmanager` 装饰器 + yield（生成器前=enter，后=exit）。
>
> **解析**：追问点："`__exit__` 返回 True 会怎样"——异常被吞（谨慎使用，通常只在特定可恢复错误返回 True）；"contextmanager 怎么写"——`@contextmanager` + yield 前后置，与 fixture yield 模式同构。

### Q18.（简答 ★★★）dict 的底层实现是什么？为什么查询快？有什么使用限制？

> **参考答案**：
> **哈希表（散列表）**：
> 1. 存取时对 key 计算 `hash(key)` 定位桶位置——平均 **O(1)** 查询/插入/删除；
> 2. **key 必须可哈希（不可变）**：str/int/tuple/frozenset 可以，**list/dict 不行**（TypeError: unhashable）；
> 3. 冲突解决用开放寻址，负载超阈值触发**扩容 rehash**（扩容瞬间有开销）；
> 4. **有序性**：3.7+ 保证**插入序**（底层紧凑数组按插入序存放）。
>
> 测试场景：用 dict 做"参数组合表"、`id_map = {u["id"]: u for u in users}` 做 O(1) 查找对比两个接口的数据一致性。
>
> **解析**：追问点："为什么 dict key 用 tuple 不用 list"——list 可变哈希值会变，找不到原桶；"dict 和 list 查找选谁"——按 key 查找必选 dict（O(1) vs O(n)），数据量大差异百倍。

### Q19.（简答 ★★★）如何用 Python 实现单例模式？

> **参考答案**：
> 三种常见实现：
>
> ```python
> # 方法一：模块级（最 Pythonic——模块天然是单例）
> # config.py 中初始化的全局对象，各处 import 即同一实例
>
> # 方法二：装饰器
> def singleton(cls):
>     instances = {}
>     def get_instance(*args, **kwargs):
>         if cls not in instances:
>             instances[cls] = cls(*args, **kwargs)
>         return instances[cls]
>     return get_instance
>
> # 方法三：__new__ 重写（面试常要求）
> class Driver:
>     _instance = None
>     def __new__(cls, *args, **kwargs):
>         if cls._instance is None:
>             cls._instance = super().__new__(cls)
>         return cls._instance
> ```
>
> **测试场景**：全局唯一 driver/session/配置对象——自动化框架里浏览器 driver 用单例避免重复启动浏览器。
>
> **解析**：追问点："单例的线程安全问题"——多线程同时判空可能创建两例，需加锁（`threading.Lock`）或用模块导入法；"`__new__` 和 `__init__` 的区别"——`__new__` 创建实例（静态），`__init__` 初始化已创建的实例。

### Q20.（简答 ★）enumerate 和 zip 的作用？

> **参考答案**：
> - `enumerate(seq, start=0)`：遍历时同时拿**索引和元素**——`for i, name in enumerate(names)`（替代 range(len(names))，Pythonic）；
> - `zip(a, b)`：多个序列**按位置配对**并行遍历——`for name, score in zip(names, scores)`，多余部分截断（`zip_longest` 可补齐）。
>
> ```python
> # 对比两个接口的返回列表（按序配对断言）
> for api_v, db_v in zip(api_list, db_list):
>     assert api_v["id"] == db_v["id"]
> ```
>
> **解析**：追问点："zip 长度不等怎么办"——`itertools.zip_longest` 用填充值补齐；"enumerate 从 1 开始计数"——`enumerate(x, start=1)`。

### Q21.（简答 ★★）Python 变量作用域规则？global 和 nonlocal 的区别？

> **参考答案**：
> 作用域链 **LEGB**：Local（函数内）→ Enclosing（外层函数）→ Global（模块级）→ Built-in（内置）。
> - **在函数内读**外层变量：直接读（先局部找不到逐层向外）；
> - **在函数内改**：赋值会创建**新的局部变量**（不修改外层）——想改模块变量加 `global x`；想改**闭包外层函数**变量加 `nonlocal x`；
> - **global**：作用于模块级变量；**nonlocal**：作用于最近的 Enclosing 作用域（不能用于模块级）。
>
> ```python
> count = 0
> def inc():
>     global count      # 不加 global 会 UnboundLocalError（先读后赋值冲突）
>     count += 1
> ```
>
> **解析**：追问点："列表为什么函数内 append 不用 global"——`lst.append` 是**调用方法**不是赋值，可变对象原地修改不需要重新绑定；"闭包里累加计数器"——nonlocal 是标准解法。

### Q22.（简答 ★★）读取一个 10GB 的日志文件并统计 ERROR 出现次数，怎么写不会撑爆内存？

> **参考答案**：
> **逐行迭代（文件对象天然是惰性迭代器）**，绝不能 `readlines()` 一次读入：
>
> ```python
> count = 0
> with open("app.log", encoding="utf-8") as f:
>     for line in f:                 # 每次只加载一行
>         if "ERROR" in line:
>             count += 1
> ```
>
> - `for line in f`：逐行流式读取，内存占用恒定；
> - `read()`/`readlines()`：整个文件/所有行进内存——10GB 直接 OOM；
> - 大数据量用**生成器管道**：`sum(1 for line in f if "ERROR" in line)`，惰性求值零中间列表。
>
> 测试场景：线上日志分析、大文件接口下载的流式校验。
>
> **解析**：追问点："生成器和列表的区别"——列表一次性物化全部元素占内存，生成器按需产出；"还要按行号取片段怎么办"——`itertools.islice(f, start, stop)` 流式跳过。

### Q23.（简答 ★★）sort() 和 sorted() 的区别？key 参数怎么用？

> **参考答案**：
> - `lst.sort()`：**原地排序**（修改原列表），返回 None；
> - `sorted(iterable)`：**返回新列表**，原数据不变（dict/set/生成器均可排序）；
> - **key 参数**：按函数结果排序——`sorted(users, key=lambda u: u["age"], reverse=True)`；
> - 多级排序：key 返回元组 `key=lambda x: (x["dept"], -x["score"])`（部门升序、分数降序）。
>
> 测试场景：断言接口返回列表的排序正确性——`assert resp_list == sorted(resp_list, key=lambda x: x["create_time"], reverse=True)`。
>
> **解析**：追问点："sorted 底层算法"——Timsort（归并+插入混合），稳定排序（相等元素保持原顺序），O(n log n)；"想按多个字段不同方向排"——key 返回元组，负号反向（数值）；字符串方向不同用两次排序（利用稳定性）。

### Q24.（简答 ★★）怎么用 Python 的 random / Faker 生成测试数据？

> **参考答案**：
> - **random 模块**：
>   - `random.randint(1, 100)` 整数、`random.choice(seq)` 随机取一个、`random.sample(seq, k)` 不重复抽样、`random.uniform(1.0, 9.9)` 浮点；
>   - `random.seed(42)` **固定随机种子**——结果可复现（失败用例可重跑定位）；
> - **Faker 库**：生成逼真的姓名/手机号/邮箱/地址（中文 locale）：
>
> ```python
> from faker import Faker
> fake = Faker("zh_CN")
> fake.name(); fake.phone_number(); fake.email(); fake.address()
> ```
>
> - **测试数据生成原则**：正常值 + 边界值（超长字符串、特殊字符、emoji）+ 格式异常都要覆盖，随机数据用于压测造数与幂等验证。
>
> **解析**：追问点："随机数据怎么断言"——记录生成值再断言（生成与校验同源）；"手机号格式怎么造"——合法号段 + random 拼接，或 Faker 的 phone_number；"seed 的作用"——同 seed 序列一致，用于复现失败。

### Q25.（简答 ★★★）Python 里它是如何管理内存的？

> **参考答案**：
> Python（CPython）内存管理 = **分配 + 回收**两条线，核心机制三句话：**内存池分配、引用计数为主、分代 GC 兜底**。
> 1. **对象分配——内存池（pymalloc）**：小对象（≤512 字节）不直接向系统申请，从**内存池**（arena → pool → block 层级）分配，减少系统调用与内存碎片；大对象直接走系统 malloc；
> 2. **引用计数（即时回收）**：每个对象记录被引用的次数（`sys.getrefcount()` 查看）——赋值、传入函数、放进容器时 +1；`del`、出作用域、从容器移除时 -1；**计数归零立即释放**；
> 3. **垃圾回收兜底（分代 GC）**：引用计数解决不了**循环引用**（`a.b = b; b.a = a`，计数永不归零），由"标记-清除 + 分代回收"兜底处理（详见下一题）；
> 4. **内存泄漏的常见来源**：全局容器（dict/list）只加不删、缓存无上限、循环引用持有大对象、C 扩展泄漏。
>
> 测试场景：自动化框架长时间运行后内存持续上涨，优先排查全局 dict 缓存 driver/结果对象只进不出。
>
> **解析**：一句话框架"**引用计数为主、分代回收兜底、内存池提效**"。追问点："引用计数的优缺点"——实时性好、开销平摊到运行全程；缺点是循环引用无解、维护计数有开销；"del x 会立刻释放内存吗"——只把引用计数减 1，归零才释放，且回收进内存池不一定马上还给操作系统。

### Q26.（简答 ★★★）简述 Python 的垃圾回收机制。

> **参考答案**：
> 以**引用计数为主，"标记-清除 + 分代回收"兜底**的混合机制：
> 1. **引用计数（主力）**：每个对象记录引用数，归零立即释放——实时、开销平摊；但**解决不了循环引用**，且维护计数本身有开销；
> 2. **标记-清除（治循环引用）**：从根对象（栈帧、全局命名空间）出发，标记所有**可达**对象；不可达的"孤岛"（即使内部互相引用）整体清除——两个循环引用的对象只要外部没人用，就会被一起回收；
> 3. **分代回收（提效）**：基于"对象越老越不容易死"的弱分代假说，对象分 **0/1/2 三代**：新对象在 0 代，0 代回收后幸存的晋升 1 代，依此类推；**代数越高扫描频率越低**（0 代最常扫），减少全量扫描开销；
> 4. **细节**：分代 GC 只针对**容器类对象**（可能产生循环引用的 list/dict/实例），int/str 等不可变对象靠引用计数即可；`gc` 模块可手动 `gc.collect()`、用 `gc.set_threshold()` 调阈值。
>
> **解析**：答题顺序背"**计数为主 → 标记清除治循环引用 → 分代提效**"。追问点："什么对象会循环引用"——容器类互相持有（列表互嵌、实例属性互指）；"怎么主动触发"——`import gc; gc.collect()`；"引用计数与分代回收谁先生效"——引用计数即时生效，分代 GC 是批量兜底，所以 Python 大部分回收是即时的。

### Q27.（简答 ★★）Python 中字典和 JSON 的区别是什么？如何相互转换？

> **参考答案**：
> 1. **本质区别**：
>    - **dict 是 Python 内存中的数据结构**（哈希表实现）；**JSON 是跨语言的数据交换格式**（本质是字符串）；
>    - dict 的 key 可以是任意可哈希对象（int/tuple 等）；**JSON 的 key 必须是字符串**；
>    - dict 的值可以是任意 Python 对象（datetime、自定义类实例）；JSON 只有 6 种类型：object / array / string / number / boolean / null；
>    - 布尔与空值写法不同：JSON 的 `true/false/null` ↔ Python 的 `True/False/None`；
>    - dict 是内存对象可调用方法；JSON 是文本，用于传输与存储，需序列化/反序列化。
> 2. **相互转换**（标准库 `json`）：
>
> ```python
> import json
>
> d = {"name": "张三", "age": 25, "tags": ["smoke", "regression"]}
> s = json.dumps(d, ensure_ascii=False)   # dict → JSON 字符串（ensure_ascii=False 保留中文）
> d2 = json.loads(s)                       # JSON 字符串 → dict
>
> json.dump(d, open("data.json", "w", encoding="utf-8"), ensure_ascii=False)   # 写文件
> d3 = json.load(open("data.json", encoding="utf-8"))                          # 读文件
> ```
>
> 3. **测试场景**：接口断言前 `resp.json()`（内部就是 loads）把响应体转 dict 再取字段；requests 传 `json=payload` 自动序列化 dict；datetime/set 等类型默认不可序列化，需 `default=` 兜底或提前转字符串。
>
> **解析**：一句话——"**dict 是 Python 对象，JSON 是字符串格式**"。追问点："dumps 报 TypeError: not JSON serializable 的常见原因"——datetime/set/自定义对象，用 `default=str` 或自定义转换；"loads 之后类型变化吗"——object→dict、array→list、true→True，数字分 int/float。


