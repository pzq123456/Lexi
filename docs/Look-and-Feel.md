# 2.5 支持多种界面风格标准（Look-and-Feel）

在系统设计中，实现硬件和软件平台的可移植性是一项重大挑战。我们希望将 Lexi 迁移到一个新平台时，不需要对系统进行大规模的重构，从而实现轻松的移植。

## 多种界面风格的障碍

界面风格标准旨在确保应用程序之间的统一性，定义了应用如何展示以及如何响应用户操作。虽然不同平台的界面风格（如 Motif、PM 等）差异不大，但仍然能清晰区分。一款需要在多个平台运行的应用，必须符合每个平台的界面风格指南。

我们的设计目标是：

- 让 Lexi 能够支持多种已有的界面风格；
- 能够轻松地添加对新风格的支持；
- 甚至能够在**运行时切换界面风格**。

---

## 抽象对象创建过程

在 Lexi 中，用户界面中的一切可见组件（glyph）都是通过组合不可见组件（如 `Row` 和 `Column`）实现的。可见组件包括按钮、滚动条、菜单等，这些组件常被称为“部件（Widget）”。

我们假设存在两组用于实现不同界面风格的 Widget 类：

1. **抽象组件类**  
   每种类型的组件都有一个抽象类。例如：  
   - `ScrollBar`：添加通用滚动条操作  
   - `Button`：添加按钮操作接口  

2. **具体实现类**  
   每个抽象类都有多个具体子类，分别实现不同的界面风格，例如：  
   - `MotifScrollBar`, `PMScrollBar`  
   - `MotifButton`, `PMButton`

为了在运行时灵活创建符合当前风格的组件，我们**不能直接使用构造函数**（如 `new MotifScrollBar`），因为这样会将具体风格硬编码进系统，难以移植和维护。

---

## 工厂与产品类

使用工厂创建组件对象是解决该问题的关键。

```cpp
ScrollBar* sb = guiFactory->CreateScrollBar();
```

其中 `guiFactory` 是 `MotifFactory`（或者其他风格的工厂）类的实例。该工厂会返回符合当前风格的滚动条实例。

### GUIFactory 类结构

我们定义一个抽象工厂类 `GUIFactory`，它声明了如下接口：

- `CreateScrollBar()`
- `CreateButton()`
- 等等……

然后为每种界面风格实现一个具体工厂类：

```cpp
class MotifFactory : public GUIFactory { ... }
class PMFactory : public GUIFactory { ... }
```

这些工厂能创建对应风格的所有组件。

### 工厂与产品的关系

- 工厂创建**产品对象**；
- 所有产品属于同一个风格系列；
- 使用统一的工厂实例即可创建同风格的所有组件。

---

## 工厂的创建方式

工厂对象 `guiFactory` 可以是：

- 全局变量；
- 静态成员；
- 本地变量（若界面集中创建）；

一个典型的初始化方式如下：

```cpp
GUIFactory* guiFactory = new MotifFactory;
```

如果支持用户在启动时指定风格：

```cpp
GUIFactory* guiFactory;
const char* styleName = getenv("LOOK_AND_FEEL");

if (strcmp(styleName, "Motif") == 0) {
    guiFactory = new MotifFactory;
} else if (strcmp(styleName, "Presentation_Manager") == 0) {
    guiFactory = new PMFactory;
} else {
    guiFactory = new DefaultGUIFactory;
}
```

或者使用注册表机制，字符串映射到工厂对象，更灵活且无需链接所有平台相关类。



## 抽象工厂模式（Abstract Factory Pattern）

本节描述的方案正是经典的**抽象工厂设计模式**：

- **目的**：在不指定具体类的前提下创建一系列相关的对象；
- **适用场景**：产品种类固定，风格种类（产品家族）可变；
- **优势**：可在运行时灵活切换组件风格而无需修改现有代码；
- **对比其他模式**：它处理的是“产品系列”，而非单一对象创建。

通过抽象工厂，我们能够构建一个既灵活又易于扩展的多平台用户界面系统。

