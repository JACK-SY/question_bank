---
title: Selenium + Pytest PO 模式入门
description: 从零搭建 Selenium + Pytest 的 Page Object 三层自动化骨架：BasePage、页面对象、conftest 与测试用例代码
---

PO（Page Object）模式是 UI 自动化的标准分层方案：**页面元素与操作封装进页面类，测试用例只写业务与断言**。本文给出可直接运行的最小骨架。

## 一、目录结构

```
ui-test/
├── conftest.py            # driver fixture（全局前后置）
├── pages/
│   ├── base_page.py       # 原子操作封装
│   └── login_page.py      # 页面对象
└── testcases/
│   └── test_login.py      # 测试用例
```

## 二、BasePage：原子操作层

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    def __init__(self, driver, timeout=10):
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)

    def open(self, url):
        self.driver.get(url)

    def find(self, locator):
        """显式等待 + 返回单个元素，统一等待策略"""
        return self.wait.until(EC.visibility_of_element_located(locator))

    def click(self, locator):
        self.wait.until(EC.element_to_be_clickable(locator)).click()

    def type(self, locator, text):
        el = self.find(locator)
        el.clear()
        el.send_keys(text)

    def text_of(self, locator) -> str:
        return self.find(locator).text
```

**要点**：所有定位统一走 `self.wait`，全项目只有一种等待策略，避免隐式/显式混用。

## 三、页面对象层

```python
from selenium.webdriver.common.by import By
from pages.base_page import BasePage

class LoginPage(BasePage):
    # 定位器集中声明，页面改版只改这里
    INPUT_USER = (By.ID, 'username')
    INPUT_PWD = (By.ID, 'password')
    BTN_LOGIN = (By.CSS_SELECTOR, 'button.login')
    MSG_ERROR = (By.CSS_SELECTOR, '.error-msg')

    def load(self):
        self.open('https://test.example.com/login')

    def login(self, user, pwd):
        self.type(self.INPUT_USER, user)
        self.type(self.INPUT_PWD, pwd)
        self.click(self.BTN_LOGIN)

    def error_msg(self) -> str:
        return self.text_of(self.MSG_ERROR)
```

## 四、conftest：driver fixture

```python
import pytest
from selenium import webdriver

@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--window-size=1440,900')
    driver = webdriver.Chrome(options=options)
    yield driver          # 用例执行
    driver.quit()         # teardown：无论用例成败都执行
```

## 五、测试用例层

```python
from pages.login_page import LoginPage
import pytest

@pytest.mark.parametrize('user,pwd,msg', [
    ('', 'abc123', '请输入账号'),
    ('13800001111', 'wrong', '账号或密码错误'),
])
def test_login_fail(driver, user, pwd, msg):
    page = LoginPage(driver)
    page.login(user, pwd)
    assert msg in page.error_msg()

def test_login_success(driver):
    page = LoginPage(driver)
    page.login('13800001111', 'Right#123')
    assert '/home' in driver.current_url
```

## 六、执行与报告

```bash
pip install selenium pytest pytest-html
pytest testcases -v --html=report.html --self-contained-html
# 并行执行
pytest testcases -n 4
```

## 七、最佳实践

1. **等待统一走显式等待**，在 BasePage 收口，禁用隐式等待与 `time.sleep`
2. **断言只写在测试层**：页面类提供取值方法，不提供断言
3. **定位器优先级**：id > CSS > XPath（相对路径），禁止绝对路径 XPath
4. 一个页面/组件一个 Page 类，公共组件（导航栏、弹窗）单独抽象复用
