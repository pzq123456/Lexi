import { Glyph, Point, Bounds } from '../core/Glyph';
import { IWindow, TextStyle, ITextMetrics } from '../core/IWindow';

export class CharacterGlyph extends Glyph {
    private text: string;
    private style: TextStyle;
    private position: Point = { x: 0, y: 0 };
    private metrics: ITextMetrics | null = null;

    constructor(text: string, style: TextStyle) {
        super();
        this.text = text;
        this.style = style;
    }

    get Text(): string {
        return this.text;
    }

    set Text(value: string) {
        this.text = value;
        this.metrics = null; // 重置度量
    }

    setPosition(pos: Point) {
        this.position = pos;
    }

    getBounds(): Bounds {
        if (!this.metrics) return { x: this.position.x, y: this.position.y, width: 0, height: 0 };
        
        return {
            x: this.position.x,
            y: this.position.y - (this.metrics.ascent),
            width: this.metrics.width,
            height: this.metrics.ascent,
        };
    }

    draw(window: IWindow): void {
        if (!this.metrics) {
            this.metrics = window.measureText(this.text, this.style);
        }
        
        window.drawText(this.text, this.getBounds(), this.style);

        // // debug
        // window.drawRect(this.getBounds(), {
        //     // fillColor: 'rgba(175, 163, 163, 0.88)',
        //     strokeColor: 'blue',
        //     lineWidth: 1
        // });
    }

    layout(window: IWindow): void {
        this.metrics = window.measureText(this.text, this.style);
    }

    getText(): string {
        return this.text;
    }

    getStyle(): TextStyle {
        return this.style;
    }
}

