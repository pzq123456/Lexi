import { TextStyle } from "../core/IWindow";

// 样式定义
export const defaultStyle: TextStyle = {
    font: '20px Arial',
    color: 'black',
    underline: false,
};

export function getRendomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export const styleVariants: TextStyle[] = [
    { ...defaultStyle, font: '35px Arial', color: getRendomColor(), underlineColor: 'black', strikethrough: true },
    { ...defaultStyle, font: '28px Arial', color: getRendomColor(), underline: true, underlineColor: 'red', backgroundColor: 'rgba(255, 0, 0, 0.2)' },
];

// 工具函数
export function isChinese(char: string): boolean {
    return /[\u4e00-\u9fa5]/.test(char);
}

export function isAlphabet(char: string): boolean {
    return /[a-zA-Z]/.test(char);
}
export function isPunctuation(char: string): boolean {
    return /[，。！？；："'、,.!?;:]/.test(char);
}

// 识别转义字符 如 \n \t
export function isEscapeChar(char: string): boolean {
    return /\\[nrt]/.test(char);
}

export function isSpace(char: string): boolean {
    return /\s/.test(char);
}

export function getRandomStyle(): TextStyle {
    return styleVariants[Math.floor(Math.random() * styleVariants.length)];
}
