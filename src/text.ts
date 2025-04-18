import { TextStyle } from "./core/IWindow";
import { CharacterGlyph } from "./glyphs/CharacterGlyph";

// export const text = "... test code code test 前前女友，时不时就跟我提以前她前男友怎样怎样，. 偶尔 world 时不时又跟 其他异性出去 玩，也是说 过几次，我的性 world 格是不喜欢吵架，没有意义，她说她也有自己的个人社交生活，我也就不多说什么，直到年底突然跟我说想让我去她家，第二年准备结婚，把我可吓的光速分手，起床后带她吃了最后一次早餐，从此不再联系。开玩笑，大家都是在玩耍，你居然想结婚？就算要结婚也不可能找这样的啊…  \n We'll define a Glyph abstract class for all objects that can appear in a document structure. Its subclasses define both primitive graphical elements (like characters and images) and structural elements (like rows and columns). Figure 2.4 depicts a representative part of the Glyph class hierarchy, and Table 2.1 presents the basic glyph interface in more detail using C++ notation. 我们可以为每个用户操作定义一个 `Menultem` 子类，然后通过硬编码每个子类来执行请求。但这样做并不完全正确，因为我们不需要为每个请求都定义一个子类，就像我们不需要为每个下拉菜单中的文本字符串定义一个子类一样。此外，这种方式将请求与特定的用户界面紧密耦合，使得在不同的用户界面中实现请求变得困难。";
export const text = 
"😀....We'll define a Glyph abstract class for all objects that can appear in a document structure. \n Its subclasses define both primitive graphical elements (like characters and images) and structural elements (like rows and columns). Figure 2.4 depicts a representative part of the Glyph class hierarchy, and Table 2.1 presents the basic glyph interface in more detail using C++ notation. 我们可以为每个用户操作定义一个 `Menultem` 子类，然后通过硬编码每个子类来执行请求。但这样做并不完全正确，因为我们不需要为每个请求都定义一个子类，就像我们不需要为每个下拉菜单中的文本字符串定义一个子类一样。此外，这种方式将请求与特定的用户界面紧密耦合，使得在不同的用户界面中实现请求变得困难。Its subclasses define both primitive graphical elements (like characters and images) and structural elements (like rows and columns). Figure 2.4 depicts a representative part of the Glyph class hierarchy, and Table 2.1 presents the basic glyph interface in more detail using C++ notation. 我们可以为每个用户操作定义一个 `Menultem` 子类，然后通过硬编码每个子类来执行请求。但这样做并不完全正确，因为我们不需要为每个请求都定义一个子类，就像我们不需要为每个下拉菜单中的文本字符串定义一个子类一样。Its subclasses define both primitive graphical elements (like characters and images) and structural elements (like rows and columns). Figure 2.4 depicts a representative part of the Glyph class hierarchy, and Table 2.1 presents the basic glyph interface in more detail using C++ notation. 我们可以为每个用户操作定义一个 `Menultem` 子类，然后通过硬编码每个子类来执行请求。但这样做并不完全正确，因为我们不需要为每个请求都定义一个子类，就像我们不需要为每个下拉菜单中的文本字符串定义一个子类一样。Its subclasses define both primitive graphical elements (like characters and images) and structural elements (like rows and columns). Figure 2.4 depicts a representative part of the Glyph class hierarchy, and Table 2.1 presents the basic glyph interface in more detail using C++ notation. 我们可以为每个用户操作定义一个 `Menultem` 子类，然后通过硬编码每个子类来执行请求。但这样做并不完全正确，因为我们不需要为每个请求都定义一个子类，就像我们不需要为每个下拉菜单中的文本字符串定义一个子类一样。";

// 样式定义
const defaultStyle: TextStyle = {
    font: '20px Arial',
    color: 'black',
    underline: false,
};


const styleVariants: TextStyle[] = [
    { ...defaultStyle, font: '30px Arial', color: "black", underline: false },
];


function getRandomStyle(): TextStyle {
    return styleVariants[Math.floor(Math.random() * styleVariants.length)];
}

// 构造字符
const chars: CharacterGlyph[] = [];

for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const style = getRandomStyle();
    chars.push(new CharacterGlyph(char, style));
}

export { chars };