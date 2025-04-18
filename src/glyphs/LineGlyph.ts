import { Glyph, Point, Bounds } from '../core/Glyph';
import { IWindow} from '../core/IWindow';
import { WordGlyph } from '../glyphs/WordGlyph';

export class LineGlyph extends Glyph {
    private position: Point = { x: 0, y: 0 };

    setPosition(pos: Point) {
        this.position = pos;
    }

    layout(window: IWindow): void {
        let x = this.position.x;
        let y = this.position.y;

        for (const word of this.children as WordGlyph[]) {
            word.setPosition({ x, y });
            word.layout(window);
            x += word.getBounds().width; // 更新x坐标，添加字符间距
        }
    }

    draw(window: IWindow): void {
        for (const word of this.children) {
            word.draw(window);
        }

        // debug
        // window.drawRect(this.getBounds(), {
        //     fillColor: 'rgba(175, 163, 163, 0.88)',
        //     strokeColor: 'blue',
        //     lineWidth: 1
        // });

        // console.log('LineGlyph bounds:', this.getBounds());
    }

    getBounds(): Bounds {
        if (this.children.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

        const first = this.children[0].getBounds();
        const last = this.children[this.children.length - 1].getBounds();

        const x = first.x;
        const y = Math.min(...this.children.map(c => c.getBounds().y)); // 计算最小y坐标

        const width = last.x + last.width - x; // 计算总宽度
        const height = Math.max(...this.children.map(c => c.getBounds().height)); // 计算最大高度

        return { x, y, width, height };
    }
}
