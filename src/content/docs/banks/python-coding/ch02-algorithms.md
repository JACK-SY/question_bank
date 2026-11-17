---
title: 第 2 章 · 算法与编程题
description: 装饰器、重试装饰器、选择排序、二分查找、冒泡排序、回文、两数之和、括号匹配、快排、递归、链表反转、栈队列等 Python 手写编程题，共 19 题
---

> **本章 19 题**：测试开发岗位手写代码高频题，均基于 Python；写完代码常被追问"给它设计测试用例"（Q6/Q13 已内置示范）。

### Q1.（简答 ★★★）编写装饰器 `log_execution`：记录函数的执行时间和调用次数，每次调用打印时间、输入参数和返回值，可应用于任何函数。

> **参考答案（思路）**：用**闭包变量**保存调用次数（`nonlocal` 修改）；`@wraps` 保留原函数元信息；`time.perf_counter()` 计时；异常也要打印日志后原样抛出。
>
> ```python
> import time
> from functools import wraps
>
> def log_execution(func):
>     call_count = 0                # 闭包变量保存调用次数
>
>     @wraps(func)                  # 保留原函数名、文档注释
>     def wrapper(*args, **kwargs):
>         nonlocal call_count
>         call_count += 1
>         start_time = time.perf_counter()
>         try:
>             result = func(*args, **kwargs)
>         except Exception as e:    # 异常也打日志后抛出
>             execute_time = time.perf_counter() - start_time
>             print(f"【函数异常】{func.__name__} 第{call_count}次调用")
>             print(f"入参 args: {args}, kwargs: {kwargs}")
>             print(f"执行耗时: {execute_time:.6f} 秒")
>             print(f"异常信息: {repr(e)}\n")
>             raise e
>
>         execute_time = time.perf_counter() - start_time
>         print("=" * 60)
>         print(f"函数名称：{func.__name__}")
>         print(f"累计调用次数：{call_count}")
>         print(f"传入位置参数 args：{args}")
>         print(f"传入关键字参数 kwargs：{kwargs}")
>         print(f"函数返回值：{result}")
>         print(f"本次执行耗时：{execute_time:.6f} 秒")
>         print("=" * 60 + "\n")
>         return result
>     return wrapper
>
> # ---------------- 测试示例 ----------------
> @log_execution
> def add(a, b):
>     return a + b
>
> @log_execution
> def calc_mul(x, y, z=10):
>     return x * y * z
>
> if __name__ == "__main__":
>     add(10, 20)
>     add(100, 200)
>     calc_mul(2, 3, z=5)
> ```
>
> **解析**：考察点：闭包 + `nonlocal`、`*args/**kwargs` 透传、`@wraps`、异常路径也计日志。追问点："并发调用计数准吗"——闭包变量非线程安全，需加锁或用 `itertools.count`。

### Q2.（简答 ★★）编写一个选择排序算法。

> **参考答案（思路）**：
> 1. 将数组分为「已排序区」和「未排序区」，初始已排序区为空；
> 2. 每一轮从未排序区找到**最小值下标**；
> 3. 与未排序区第一个元素交换，并入已排序区；
> 4. 重复直到全部有序。时间复杂度 O(n²)，不稳定排序。
>
> ```python
> def selection_sort(arr):
>     n = len(arr)
>     for i in range(n - 1):          # 外层控制已排序边界
>         min_index = i               # 假设当前 i 是最小值下标
>         for j in range(i + 1, n):   # 找未排序区间的最小元素
>             if arr[j] < arr[min_index]:
>                 min_index = j
>         arr[i], arr[min_index] = arr[min_index], arr[i]
>     return arr
>
> if __name__ == "__main__":
>     print("排序结果：", selection_sort([7, 3, 5, 2, 9, 1]))
>     # 排序结果： [1, 2, 3, 5, 7, 9]
> ```
>
> **解析**：追问点："与冒泡的区别"——冒泡是相邻两两交换（交换次数多），选择排序每轮只交换一次；"是否稳定"——不稳定（相等元素可能改变相对次序）。

### Q3.（简答 ★★）编写一个二分查找算法。

> **参考答案**：前提是**有序数组**；双指针收缩区间，每次比较中点排除一半。时间复杂度 O(log n)。
>
> ```python
> def binary_search(nums, target):
>     left, right = 0, len(nums) - 1
>     while left <= right:
>         mid = left + (right - left) // 2   # 避免溢出写法
>         if nums[mid] == target:
>             return mid                      # 找到目标，返回下标
>         elif nums[mid] < target:
>             left = mid + 1                  # 目标在右半区
>         else:
>             right = mid - 1                 # 目标在左半区
>     return -1                               # 不存在
>
> if __name__ == "__main__":
>     arr = [1, 3, 5, 7, 9, 11, 13]
>     print(binary_search(arr, 7))   # 输出 3
>     print(binary_search(arr, 4))   # 输出 -1
> ```
>
> **解析**：追问点："mid 为什么不写 (left+right)//2"——其他语言中两者相加可能整型溢出，Python 无此问题但规范写法值得保留；"边界条件"——`left <= right` 收敛到单元素也要判。

### Q4.（简答 ★★）编写一个冒泡排序算法，要求能进行正序和反序。

> **参考答案（思路）**：
> 1. 冒泡：相邻元素两两比较，逆序则交换，每轮把极值"浮"到末尾；
> 2. 增加参数 `asc`：`True` 升序（正序），`False` 降序（反序）；
> 3. 优化：标记本轮是否发生交换，已有序时提前终止。
>
> ```python
> def bubble_sort(arr, asc: bool = True):
>     arr_copy = arr.copy()           # 拷贝数组，不修改原列表
>     n = len(arr_copy)
>     for i in range(n - 1):          # 外层控制轮数
>         swap_flag = False
>         for j in range(n - 1 - i):  # 每轮末尾 i 个已有序
>             if asc:                 # 升序：前>后则交换
>                 if arr_copy[j] > arr_copy[j + 1]:
>                     arr_copy[j], arr_copy[j + 1] = arr_copy[j + 1], arr_copy[j]
>                     swap_flag = True
>             else:                   # 降序：前<后则交换
>                 if arr_copy[j] < arr_copy[j + 1]:
>                     arr_copy[j], arr_copy[j + 1] = arr_copy[j + 1], arr_copy[j]
>                     swap_flag = True
>         if not swap_flag:           # 本轮无交换，已有序，提前退出
>             break
>     return arr_copy
>
> if __name__ == "__main__":
>     test_arr = [5, 2, 9, 1, 5, 6]
>     print("正序升序：", bubble_sort(test_arr, asc=True))    # [1, 2, 5, 5, 6, 9]
>     print("反序降序：", bubble_sort(test_arr, asc=False))   # [9, 6, 5, 5, 2, 1]
>     print("原始数组：", test_arr)                            # 原数组不变
> ```
>
> **解析**：亮点是三个工程细节：**不改原数组**（copy 后排序）、**提前终止**优化、方向参数化。追问点："最好/最坏复杂度"——最好 O(n)（已有序，靠 swap_flag 提前退出），最坏/平均 O(n²)。

### Q5.（简答 ★）手写：反转字符串 + 判断字符串是否为回文。

> **参考答案**：
>
> ```python
> def reverse_str(s: str) -> str:
>     return s[::-1]                    # 切片反转，O(n)
>
> def is_palindrome(s: str) -> bool:
>     return s == s[::-1]               # 反转后与原串比较
>
> # 双指针写法（面试更常要求，体现对指针的理解）
> def is_palindrome2(s: str) -> bool:
>     left, right = 0, len(s) - 1
>     while left < right:
>         if s[left] != s[right]:
>             return False
>         left, right = left + 1, right - 1
>     return True
> ```
>
> 进阶变体（面试常见追问）："忽略大小写与空格"——先预处理 `s = ''.join(c.lower() for c in s if c.isalnum())` 再判断。
>
> **解析**：切片写法考 Python 熟练度，双指针写法考通用算法思维（Java 等语言没有切片）。追问点："复杂度"——两种都是 O(n) 时间、O(n) 空间（字符串切片会复制；双指针 O(1) 空间）。

### Q6.（简答 ★★★）手写：两数之和——给定整数数组 nums 和目标值 target，返回和为 target 的两个元素下标。

> **参考答案**：
>
> ```python
> def two_sum(nums: list, target: int):
>     seen = {}                          # 值 -> 下标
>     for i, num in enumerate(nums):
>         complement = target - num      # 需要配对的另一个数
>         if complement in seen:
>             return [seen[complement], i]
>         seen[num] = i
>     return []
>
> if __name__ == "__main__":
>     print(two_sum([2, 7, 11, 15], 9))   # [0, 1]
> ```
>
> 核心思路：**用哈希表把"查找配对数"从 O(n) 降到 O(1)**，一遍遍历 O(n) 时间 O(n) 空间；暴力双循环是 O(n²)。
>
> **解析**：LeetCode 高频第一题，测开面试常在写完后追加"**给你写的函数设计测试用例**"：正常对、存在多组解、无解返回空、重复元素（[3,3] target=6）、负数与零、空数组——正好衔接测试用例设计能力。追问点："数组已有序怎么办"——双指针夹逼 O(n) 且省空间；"找三个数呢"——排序后固定一个数 + 两数之和。

### Q7.（简答 ★★）手写：统计字符串中每个字符出现的次数。

> **参考答案**：
>
> ```python
> def count_chars(s: str) -> dict:
>     counter = {}
>     for ch in s:
>         counter[ch] = counter.get(ch, 0) + 1
>     return counter
>
> # 更简洁的内置方案
> from collections import Counter
> Counter("aabbbcc")        # Counter({'b': 3, 'a': 2, 'c': 2})
> Counter("aabbbcc").most_common(2)   # 出现最多的前2个
> ```
>
> 核心思路：**dict 哈希表计数**，O(n) 一遍遍历。
>
> **解析**：这题的进阶问法是"统计日志中每个 IP 出现次数 / 单词频次"——同一模式：`Counter(line.split()[0] for line in f)`。追问点："Counter 和手写 dict 的取舍"——Counter 语义清晰自带 most_common，面试建议手写展示基本功、顺带提 Counter。

### Q8.（简答 ★★）手写：列表去重且保持原有顺序。

> **参考答案**：
>
> ```python
> def dedup(lst: list) -> list:
>     seen = set()
>     result = []
>     for x in lst:
>         if x not in seen:
>             seen.add(x)
>             result.append(x)
>     return result
>
> # 一行写法（dict 保序，3.7+）
> def dedup2(lst: list) -> list:
>     return list(dict.fromkeys(lst))
> ```
>
> 注意：直接 `list(set(lst))` 会**打乱顺序**（哈希无序），不符合"保持顺序"的要求。
>
> **解析**：追问点："复杂度"——两种都是 O(n)（set 查找 O(1)）；"元素不可哈希（列表套列表）怎么去重"——转元组/JSON 串再判断，或 O(n²) 逐个比较。

### Q9.（简答 ★★）手写：合并两个有序列表为一个有序列表（不许用 sort）。

> **参考答案**：
>
> ```python
> def merge_sorted(a: list, b: list) -> list:
>     i = j = 0
>     result = []
>     while i < len(a) and j < len(b):
>         if a[i] <= b[j]:          # <= 保证稳定性
>             result.append(a[i]); i += 1
>         else:
>             result.append(b[j]); j += 1
>     result.extend(a[i:])          # 剩余部分直接拼接
>     result.extend(b[j:])
>     return result
>
> print(merge_sorted([1, 3, 5], [2, 4, 6]))   # [1, 2, 3, 4, 5, 6]
> ```
>
> 核心思路：**双指针各指队首，每次取较小者**——归并排序的合并步骤，O(m+n) 时间。
>
> **解析**：追问点："复杂度"——O(m+n)，比两个列表拼一起再 sort 的 O((m+n)log(m+n)) 好；"合并 K 个有序列表"——用堆（heapq.merge 或小顶堆）O(N log K)。

### Q10.（简答 ★★★）手写：判断字符串中的括号是否合法匹配（如 "{[()]}" 合法，"{[(])}" 不合法）。

> **参考答案**：
>
> ```python
> def valid_brackets(s: str) -> bool:
>     pairs = {")": "(", "]": "[", "}": "{"}
>     stack = []
>     for ch in s:
>         if ch in "([{":
>             stack.append(ch)              # 左括号入栈
>         elif ch in pairs:
>             if not stack or stack.pop() != pairs[ch]:
>                 return False              # 栈空或最近左括号不匹配
>     return not stack                      # 全部弹出才算合法
> ```
>
> 核心思路：**栈（后进先出）**——左括号入栈，右括号与栈顶匹配；O(n) 时间。
>
> **解析**：经典栈应用。追问点："三类常见错误"——右括号先出现（栈空）、类型不匹配、左括号多余（遍历完栈非空）；"要校验代码里的括号怎么办"——先过滤字符串常量与注释再入栈。

### Q11.（简答 ★★★）手写：快速排序。

> **参考答案**：
>
> ```python
> def quick_sort(arr: list) -> list:
>     if len(arr) <= 1:
>         return arr
>     pivot = arr[len(arr) // 2]        # 取中间值做基准
>     left  = [x for x in arr if x < pivot]
>     mid   = [x for x in arr if x == pivot]
>     right = [x for x in arr if x > pivot]
>     return quick_sort(left) + mid + quick_sort(right)
> ```
>
> 核心思路：**分治**——选基准把数组分成"小于/等于/大于"三段，递归处理两侧。平均 O(n log n)，最坏 O(n²)（基准选到极值）。
>
> **解析**：这个版本易写易读（非原地），面试可先写它，再说明原地 partition 的进阶写法（Lomuto/Hoare，O(log n) 额外空间）。追问点："最坏情况怎么触发"——已有序数组 + 首元素做基准退化为 O(n²)，随机选基准规避；"和归并排序的区别"——快排原地、不稳定、最坏 O(n²)；归并稳定、O(n) 空间。

### Q12.（简答 ★★）手写：用递归实现阶乘与斐波那契数列，并说明各自的效率问题。

> **参考答案**：
>
> ```python
> def factorial(n: int) -> int:
>     return 1 if n <= 1 else n * factorial(n - 1)
>
> def fib(n: int) -> int:
>     if n <= 1:
>         return n
>     return fib(n - 1) + fib(n - 2)    # 递归树爆炸：O(2^n)
>
> # 优化：迭代 O(n)
> def fib_fast(n: int) -> int:
>     a, b = 0, 1
>     for _ in range(n):
>         a, b = b, a + b
>     return a
> ```
>
> 要点：递归要有**终止条件**；朴素递归 fib 存在大量重复子问题——**记忆化**（`functools.lru_cache`）或迭代到 O(n)。
>
> **解析**：追问点："递归太深的报错"——`RecursionError: maximum recursion depth exceeded`（默认约 1000 层），改迭代或 lru_cache；"阶乘 n=0 返回什么"——1（数学定义，也是终止条件）。

### Q13.（简答 ★）手写：打印 1000 以内的水仙花数（各位数字立方和等于自身，如 153）。

> **参考答案**：
>
> ```python
> result = []
> for num in range(100, 1000):
>     digits = str(num)
>     if num == sum(int(d) ** 3 for d in digits):
>         result.append(num)
> print(result)     # [153, 370, 371, 407]
> ```
>
> 核心思路：遍历 + **逐位分解**（转字符串取位或 `% 10` 取余）。
>
> **解析**：经典入门题，考察点在代码简洁度。追问点："任意位数的水仙花数"——位数 n 时按 `sum(d ** len(digits))` 判断；"写完怎么设计测试用例"——已知解（153）作为校验数据、边界（99/100/999）。

### Q14.（简答 ★★★）手写：反转单链表。

> **参考答案**：
>
> ```python
> class ListNode:
>     def __init__(self, val=0, next=None):
>         self.val, self.next = val, next
>
> def reverse_list(head):
>     prev, cur = None, head
>     while cur:
>         nxt = cur.next       # 暂存后继
>         cur.next = prev      # 反转指针
>         prev, cur = cur, nxt # 双指针前进
>     return prev              # 新头节点
> ```
>
> 核心思路：**迭代 + 三指针**（prev/cur/nxt），逐个把 next 指向前驱；O(n) 时间 O(1) 空间。
>
> **解析**：链表第一高频题。追问点："递归写法"——`new_head = reverse(cur.next)` 后 `cur.next.next = cur; cur.next = None`；"空间复杂度对比"——迭代 O(1)，递归 O(n) 栈空间；"能不能只反转部分区间"——LeetCode 92 题，先定位再局部反转。

### Q15.（简答 ★★）手写：求两个整数列表的交集与并集（不去重按元素个数）。

> **参考答案**：
>
> ```python
> # 去重版（set 一步到位）
> inter = list(set(a) & set(b))
> union = list(set(a) | set(b))
>
> # 计数版（保留重复个数，Counter 取 min/max）
> from collections import Counter
> ca, cb = Counter(a), Counter(b)
> inter = list((ca & cb).elements())     # 取较小计数
> union = list((ca | cb).elements())     # 取较大计数
> ```
>
> 核心思路：set 交并补用 `&` `|` `-`；**涉及重复元素时用 Counter**（& 取 min、| 取 max 计数）。
>
> **解析**：追问点："复杂度"——set 方案 O(m+n)（哈希），比双层循环 O(m·n) 好；"要按原列表顺序输出交集"——遍历 a 判断 `x in set(b)` 保持 a 的顺序。

### Q16.（简答 ★★）手写：字符串压缩，"aaabbc" → "a3b2c1"；若压缩后更长则返回原串。

> **参考答案**：
>
> ```python
> def compress(s: str) -> str:
>     if not s:
>         return s
>     parts, count = [], 1
>     for i in range(1, len(s)):
>         if s[i] == s[i - 1]:
>             count += 1
>         else:
>             parts.append(s[i - 1] + str(count))
>             count = 1
>     parts.append(s[-1] + str(count))
>     result = "".join(parts)
>     return result if len(result) < len(s) else s
> ```
>
> 核心思路：**一次遍历分组计数**（相邻比较），最后比较压缩前后长度取短者。
>
> **解析**：追问点："为什么可能更长"——"a" 压成 "a1" 变 2 位；"字符全是数字会不会歧义"——真实面试可追问分隔符设计（如 "a|3"）。

### Q17.（简答 ★★★）手写：用两个栈实现队列（push 在队尾，pop 从队头出）。

> **参考答案**：
>
> ```python
> class MyQueue:
>     def __init__(self):
>         self.in_stack, self.out_stack = [], []
>
>     def push(self, x):
>         self.in_stack.append(x)
>
>     def pop(self):
>         self._shift()
>         return self.out_stack.pop()
>
>     def _shift(self):
>         if not self.out_stack:            # 出栈空了才倒腾
>             while self.in_stack:
>                 self.out_stack.append(self.in_stack.pop())
>
> # push 1,2,3 → pop 应得 1,2,3（FIFO）
> ```
>
> 核心思路：**入栈只管进、出栈空时把入栈全部倒入出栈**——顺序自然翻转实现先进先出。均摊 O(1)（每个元素最多进出各栈一次）。
>
> **解析**：追问点："为什么均摊 O(1)"——倒腾是分摊的，摊到每次操作；"两个队列实现栈呢"——反着来，用一个队列 + 队尾重排亦可。

### Q18.（简答 ★★）手写：统计一个英文句子中出现次数最多的单词（忽略大小写）。

> **参考答案**：
>
> ```python
> import re
> from collections import Counter
>
> def top_word(sentence: str):
>     words = re.findall(r"[a-zA-Z']+", sentence.lower())   # 分词并统一小写
>     counter = Counter(words)
>     return counter.most_common(1)[0]      # (单词, 次数)
>
> print(top_word("The cat and THE dog. The end!"))   # ('the', 3)
> ```
>
> 核心思路：**清洗（lower + 正则分词）→ Counter 计数 → most_common 取最值**。
>
> **解析**：追问点："不用正则怎么分词"——`sentence.lower().split()` 但会带标点（需 strip 标点）；"并列最多怎么办"——遍历 counter 找所有 count == max 的词；"和 Linux 命令对上"——`grep -o . | sort | uniq -c | sort -rn`（呼应 Linux 与 SQL 章）。

### Q19.（简答 ★★★）用 Python 实现一个简单的接口请求重试装饰器。

> **参考答案**：
>
> ```python
> import time
> import functools
> import requests
>
> def retry(max_retries=3, delay=1, exceptions=(requests.RequestException,)):
>     """失败自动重试装饰器：最多重试 max_retries 次，每次间隔 delay 秒"""
>     def decorator(func):
>         @functools.wraps(func)                 # 保留原函数名/文档
>         def wrapper(*args, **kwargs):
>             last_exc = None
>             for attempt in range(1, max_retries + 1):
>                 try:
>                     return func(*args, **kwargs)      # 成功直接返回
>                 except exceptions as e:
>                     last_exc = e
>                     print(f"[retry] {func.__name__} 第{attempt}次失败: {e}")
>                     if attempt < max_retries:
>                         time.sleep(delay)             # 间隔后再试
>             raise last_exc              # 重试耗尽，抛最后一次异常
>         return wrapper
>     return decorator
>
> @retry(max_retries=3, delay=1)
> def get_user(uid):
>     resp = requests.get(f"https://api.example.com/users/{uid}", timeout=2)
>     resp.raise_for_status()           # 非 2xx 抛 HTTPError，纳入重试范围
>     return resp.json()
> ```
>
> 要点：
> - **带参装饰器 = 三层结构**：外层收参数 → 中层收函数 → 内层做包装（对比无参装饰器两层）；
> - `@functools.wraps` 保留原函数元信息（`__name__`/`__doc__`），否则日志与测试报告里函数名全变成 wrapper；
> - **只捕获"值得重试"的异常**（网络/超时/5xx），断言失败等业务异常不重试——重试不能掩盖真 bug；
> - 进阶：间隔改**指数退避** `delay * 2 ** attempt` 防重试风暴；生产可直接用 `tenacity` 库（`@retry(stop=stop_after_attempt(3))`）；用例级重试用 pytest-rerunfailures。
>
> **解析**：追问点："非幂等接口（下单/支付）能无脑重试吗"——不能，需带幂等键或仅在"确定未到达服务端"的错误（超时/连接失败）时重试；"重试耗尽后异常怎么处理"——抛最后一次异常由调用方决定后续，不要静默返回 None。


