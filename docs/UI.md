# 2.4 装饰用户界面（Embellishing the User Interface）

我们考虑在 Lexi 的用户界面中添加两个装饰功能。第一个是在文本编辑区域周围添加边框，以标示文本页的范围；第二个是添加滚动条，使用户可以查看页面的不同部分。

为了方便在运行时添加和移除这些装饰功能，不应使用继承来实现。为了获得最大的灵活性，其他用户界面对象甚至不应知道装饰的存在。这样我们就可以在不更改其他类的前提下添加和删除装饰。

## 透明封装（Transparent Enclosure）

从编程的角度来看，为用户界面添加装饰涉及对现有代码的扩展。使用继承进行扩展不仅限制了运行时的重组能力，还会导致类爆炸问题。

例如，我们可以通过将 `Composition` 子类化为 `BorderedComposition` 来添加边框；或者创建 `ScrollableComposition` 来添加滚动条。如果同时需要边框和滚动条，我们就得创建 `BorderedScrollableComposition`。这样一来，每种装饰组合都需要一个类，最终将变得难以维护。

对象组合（object composition）提供了一种更可行、更灵活的扩展机制。

### 谁来组合谁？

假设我们将装饰本身（如边框）做成一个对象（比如类 `Border` 的实例），那么我们有两个组合对象：glyph 和 border。我们可以让 `Border` 包含 `Glyph`，因为边框在屏幕上包围着 glyph。反之亦可，但那需要改动 `Glyph` 的子类，使其感知边框，这种做法不理想。

**正确方式**：让 `Border` 包含 `Glyph`，将绘制边框的逻辑完全保留在 `Border` 类中，不影响其他类。

### 为什么 `Border` 应该是 `Glyph` 的子类？

因为边框具有外观，也应该是一种 glyph。更重要的是，**客户端不应关心 glyph 是否有边框**。客户端应以统一方式处理所有 glyph，无论它们是否被装饰。为了保证接口一致性，我们让 `Border` 继承自 `Glyph`。

这就是 **透明封装（transparent enclosure）** 的核心思想：结合了：

1. 单子对象组合（single-child composition）
2. 接口兼容性

客户端通常无法分辨自己处理的是组件本身还是其封装体，尤其当封装体将所有操作都委托给组件时。封装体也可以通过在委托前后添加逻辑来扩展组件的行为，甚至可以为组件添加状态。

## MonoGlyph

我们可以将透明封装的概念应用于所有装饰其他 glyph 的 glyph。为此，我们定义 `Glyph` 的一个子类 `MonoGlyph`，作为“装饰 glyph”的抽象类（如 `Border`）。

`MonoGlyph` 存储一个组件引用，并将所有请求转发给它。

### 示例代码

```cpp
void MonoGlyph::Draw(Window* w) {
    _component->Draw(w);
}
