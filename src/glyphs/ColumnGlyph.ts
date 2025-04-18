// glyphs/ColumnGlyph.ts
import { Glyph, Point, Bounds } from '../core/Glyph';
import { IWindow } from '../core/IWindow';
import { LineGlyph } from './LineGlyph';

export class ColumnGlyph extends Glyph {
    private position: Point = { x: 0, y: 0 };
    private lineGap; // 行间距

    constructor(lineGap: number = 10) {
        super();
        this.lineGap = lineGap;
    }

    setPosition(pos: Point) {
        pos.y += this.children[0].getBounds().height; // fix: 文字绘制基线问题导致第一行超出预期
        this.position = pos;
    }

    layout(window: IWindow): void {
        let x = this.position.x;
        let y = this.position.y;

        for (const line of this.children as LineGlyph[]) {
            line.setPosition({ x, y });
            line.layout(window);
            y += line.getBounds().height + this.lineGap; // 更新y坐标，添加行间距
        }
    }

    getBounds(): Bounds {
        if (this.children.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

        const first = this.children[0].getBounds();
        const last = this.children[this.children.length - 1].getBounds();

        const x = first.x;
        const y = Math.min(...this.children.map(c => c.getBounds().y)); // 计算最小y坐标

        const width = Math.max(...this.children.map(c => c.getBounds().width));
        const height = last.y + last.height - y; // 计算总高度

        return { x, y, width, height };
    }

    draw(window: IWindow): void {
        for (const line of this.children as LineGlyph[]) {
            line.draw(window);
        }

        // window.drawRect(this.getBounds(), {
        //     fillColor: 'rgba(114, 185, 207, 0.1)',
        //     strokeColor: 'green',
        //     lineWidth: 1
        // });

        // // 绘制 0,0 ,长宽各为 50 的测试矩形
        // window.drawRect({ x: 0, y: 30, width: 150, height: 150 }, {
        //     fillColor: 'rgba(114, 185, 207, 0.1)',
        //     strokeColor: 'red',
        //     lineWidth: 1
        // });
    }
}
