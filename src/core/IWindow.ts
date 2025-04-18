import { Bounds } from './Glyph';

export interface TextStyle {
    font: string;              // e.g. 'italic bold 16px Arial'
    color: string;             // fill color
    underline?: boolean;
    strikethrough?: boolean;
    wavyUnderline?: boolean;
    underlineColor?: string;
    backgroundColor?: string;
}

// rect style
export interface RectStyle {
    fillColor?: string;       // fill color
    strokeColor?: string;     // stroke color
    lineWidth?: number;       // stroke width
}

export interface ITextMetrics {
    width: number;
    ascent: number; // 上升线
    descent: number; // 下降线
}

export interface IWindow {

    getWidth(): number;
    getHeight(): number;

    /** 绘制实线矩形（用于光标或选区） */
    drawRect(Bounds: Bounds, style: RectStyle): void;

    /** 绘制文本（带样式） */
    drawText(text: string, Bounds: Bounds, style: TextStyle): void;

    /** 测量指定样式下的文本尺寸（为排版做准备） */
    measureText(text: string, style: TextStyle): ITextMetrics;

    /** 绘制背景色块（用于选区、语法高亮） */
    fillRect(bounds: Bounds, color: string): void;

    /** 获取 Canvas DOM 引用（便于交互层注册事件） */
    getCanvas(): HTMLCanvasElement;

    drawLine(x1: number, y1: number, x2: number, y2: number, color: string): void;

    drawWavyLine(x1: number, y1: number, x2: number, color: string): void;

    /** 清空画布 */
    clear(): void;
}
