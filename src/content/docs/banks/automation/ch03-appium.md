---
title: 第 3 章 · App 自动化（Appium）
description: Appium 原理架构、ADB 常用命令、元素定位排查、WebView 混合应用、弹窗处理与 Monkey 测试，共 6 题
---

> **本章 6 题**：以 Appium（Python 绑定）+ Android（UIAutomator2）为基准，覆盖原理、ADB、定位排查与混合应用。

### Q1.（简答 ★★）在 APP 自动化测试的时候，如果突然出现弹框该怎么处理？

> **参考答案**：
> - **通用处理**：封装"关闭弹窗"公共方法——枚举常见弹窗（升级提示、广告、权限、消息推送），按优先级尝试捕获关闭 / 跳过按钮并点击，找不到元素则捕获异常直接跳过，保证用例不因偶发弹窗中断。
> - **全局监听**：设置全局弹窗监听器（如 **WebDriverWatch 监听器 / implicit 弹窗监听**），每次操作前自动检测并处理弹窗，用例脚本本身无感知。
> - **工程补充**：测试账号提前关闭推送/升级弹窗（从源头减少弹窗）；弹窗页可加入白名单配置，新弹窗只改配置不改代码。
>
> **解析**：答题体现"**封装 + 兜底**"思想：弹窗处理是稳定性工程，不是逐条用例写 if-else。追问点："弹窗处理放在什么层"——放在 driver 封装层/BasePage，而非具体用例里。

### Q2.（简答 ★★★）简述 Appium 的工作原理（架构）。

> **参考答案**：
> Appium 是 **C/S（客户端-服务器）架构**的移动端自动化框架，本质是**移动端的 WebDriver**：
> 1. **客户端（Client）**：测试脚本（Python/Java 等）通过 Appium 客户端库，按 **WebDriver 协议（W3C 标准）**发送 HTTP 请求；
> 2. **服务端（Server）**：Appium Server 监听请求，把 WebDriver 协议命令翻译为平台自动化指令；
> 3. **驱动（Driver）**：Android 用 **UIAutomator2**、iOS 用 **XCUITest**，驱动直接操纵设备/模拟器上的 UI；
> 4. **设备端**：被测 App 接收指令执行点击、输入、滑动等操作并返回结果。
>
> 核心优势：协议标准化使**同一套脚本风格跨 Android/iOS 复用**，且不依赖被测 App 源码（黑盒）。
>
> **解析**：追问点："Appium 需要服务器吗"——需要，但通常就是本机启动的一个 Node 进程（`appium` 命令），监听 4723 端口；"和 Selenium 的关系"——同源协议，Selenium 管 Web 浏览器，Appium 管移动原生/混合应用。

### Q3.（简答 ★★）ADB 是什么？说几个常用的 adb 命令。

> **参考答案**：
> **ADB（Android Debug Bridge）**：安卓调试桥，PC 与 Android 设备通信的命令行工具（C/S 架构），是 App 自动化与真机调试的基础。
> - `adb devices`：查看已连接设备（自动化前置检查）；
> - `adb install / uninstall`：安装、卸载 APK；
> - `adb shell`：进入设备 shell；`adb shell dumpsys activity top`：查看**当前界面 Activity**；
> - `adb shell pm list packages`：列出包名（配合 `grep` 查找被测应用）；
> - `adb logcat`：抓取设备日志（`| grep ERROR` 过滤，`> app.log` 保存）；
> - `adb pull / push`：设备与 PC 互传文件；
> - `adb shell input tap/swipe/text`：模拟点击/滑动/输入（无 Appium 时的快速操作）。
>
> **解析**：面试高频场景是"**获取被测 App 的包名和启动 Activity**"：先 `adb shell pm list packages | grep xxx` 找包名，再打开目标页后 `adb shell dumpsys activity top` 取当前 Activity。追问点："adb logcat 怎么只看某应用"——`--pid` 或按包名进程过滤。

### Q4.（简答 ★★★）Appium 运行中定位不到元素，你怎么排查？

> **参考答案**：
> 按排查链逐层定位：
> 1. **设备与应用状态**：`adb devices` 确认设备在线，确认 App 已打开且**停在目标页面**（脚本跳转是否成功）；
> 2. **定位表达式**：用 **uiautomatorviewer / Appium Inspector** 刷新 UI 树，确认元素存在、表达式正确；属性是动态生成的（如 `resource-id` 带随机数字）就换稳定属性（id / accessibility id / 相对 XPath）；
> 3. **等待问题**：页面/元素未加载完（转圈、异步请求），加**显式等待** `WebDriverWait(...).until(expected_conditions...)`；
> 4. **上下文问题**：WebView/混合页面在原生上下文里看不到 H5 元素，需 `switch_to.context()` 切换；
> 5. **遮挡与可见性**：弹窗遮挡先关弹窗；元素在屏幕外先滑动到可见。
>
> **解析**：答题要点是"**从环境到脚本、从元素到上下文**"的完整排查链，而不是上来就改定位器。追问点："uiautomatorviewer 刷新报错怎么办"——重启 uiautomator 服务或换 Appium Inspector；"怎么定位 WebView 里的元素"——见下一题。

### Q5.（简答 ★★★）什么是混合应用（Hybrid App）？Appium 如何测试其中的 WebView 页面？

> **参考答案**：
> **混合应用 = 原生壳 + WebView 加载 H5 页面**（如 App 内嵌的活动页、帮助中心）。原生部分与 H5 部分分属两个"上下文"，元素定位方式完全不同，必须切换：
> 1. 环境准备：安装与 WebView 内核版本匹配的 **Chromedriver**；
> 2. `driver.contexts` 获取所有上下文（形如 `NATIVE_APP`、`WEBVIEW_com.xxx`）；
> 3. `driver.switch_to.context('WEBVIEW_com.xxx')` 切入 WebView——之后就是**标准 Selenium 定位**（`find_element(By.CSS_SELECTOR...)`）；
> 4. 操作完 `switch_to.context('NATIVE_APP')` 切回原生。
>
> 调试技巧：手机开启 WebView 调试后，PC 端 Chrome 打开 `chrome://inspect` 可直接看到 H5 页面的 DOM 结构。
>
> **解析**：追问点："怎么判断当前该切上下文了"——页面元素在原生上下文定位不到且 Inspector 显示的是 H5 内容；"原生和 WebView 的定位差异"——原生用 id/xpath（resource-id、text），WebView 内用 CSS/XPath。

### Q6.（简答 ★）什么是 Monkey 测试？它属于自动化测试吗？

> **参考答案**：
> **Monkey 是 Android 自带的随机事件压力测试工具**，向系统发送伪随机的用户事件流（点击、滑动、按键、系统事件），命令如 `adb shell monkey -p com.xxx -v 10000`（对指定包发送 10000 个事件）。
> - **目的**：稳定性与异常测试——发现 ANR、Crash、内存泄漏等随机操作才暴露的问题；
> - **属于自动化**（广义的稳定性自动化/压力测试），但**不可控、路径随机**，用于"耐操性"而非功能断言；
> - **可复现技巧**：`-s <seed>` 固定随机种子，同一 seed 事件序列一致，方便复现崩溃。
>
> **解析**：追问点："monkey 和自动化脚本的区别"——monkey 随机无断言、发现未知问题；脚本确定性有断言、验证已知业务；"怎么定位 monkey 崩溃"——logcat 里搜 ANR/Crash/FATAL，配合 seed 复现。

