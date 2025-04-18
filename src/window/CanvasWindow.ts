import { Bounds } from '../core/Glyph.ts';
import { IWindow, TextStyle, ITextMetrics, RectStyle } from '../core/IWindow.ts';

/**
 * 使用 Canvas API 实现的窗口类，支持富文本样式绘制
 */
export class CanvasWindow implements IWindow {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get 2D context');
        this.context = ctx;
    }

    getWidth(): number {
        return this.canvas.width;
    }
    getHeight(): number {
        return this.canvas.height;
    }

    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    clear(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawRect(bounds: Bounds, style: RectStyle): void {
        const ctx = this.context;
        ctx.fillStyle = style.fillColor || 'transparent';
        ctx.strokeStyle = style.strokeColor || 'black';
        ctx.lineWidth = style.lineWidth || 1;

        ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
    }

    fillRect(bounds: Bounds, color: string): void {
        this.context.fillStyle = color;
        this.context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    measureText(text: string, style: TextStyle): ITextMetrics {
        this.applyStyle(style);
        const metrics = this.context.measureText(text);
        return {
            width: metrics.width,
            ascent: metrics.actualBoundingBoxAscent,
            descent: metrics.actualBoundingBoxDescent,
        };
    }

    drawText(text: string, bounds: Bounds, style: TextStyle): void {
        const ctx = this.context;
        this.applyStyle(style);

        const x = bounds.x;
        const y = bounds.y;

        ctx.fillText(text, x, y + bounds.height);


        // // 绘制背景色
        if (style.backgroundColor) {
            ctx.fillStyle = style.backgroundColor;

            ctx.fillRect(x, y, bounds.width, bounds.height);

            this.applyStyle(style); // 恢复文字颜色
        }


        // 装饰线统一处理
        const metrics = this.measureText(text, style);
        const baselineY = y + bounds.height;

        // 下划线
        if (style.underline) {
            this.drawLine(x, baselineY + 1, x + metrics.width, baselineY + 1, style.underlineColor || style.color);
        }

        // 删除线
        if (style.strikethrough) {
            const midY = baselineY - metrics.ascent / 2;
            this.drawLine(x, midY, x + metrics.width, midY, style.underlineColor || style.color);
        }

        // 波浪线
        if (style.wavyUnderline) {
            this.drawWavyLine(x, baselineY + 2, metrics.width + x, style.underlineColor || style.color);
        }
    }

    private applyStyle(style: TextStyle) {
        this.context.font = style.font;
        this.context.fillStyle = style.color;
    }

    drawLine(x1: number, y1: number, x2: number, y2: number, color: string) {
        const ctx = this.context;
        ctx.strokeStyle = color;
        // 设置线宽
        ctx.lineWidth = 2; // 可根据需要调整线宽
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    drawWavyLine(x1: number, y1: number, x2: number, color: string) {
        const ctx = this.context;
        const amplitude = 2; // 波浪线的振幅
        const frequency = 1; // 波浪线的频率
        ctx.strokeStyle = color;
        ctx.lineWidth = 1; // 可根据需要调整线宽
        ctx.beginPath();
        for (let x = x1; x <= x2; x++) {
            const y = y1 + amplitude * Math.sin(frequency * (x - x1));
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}
