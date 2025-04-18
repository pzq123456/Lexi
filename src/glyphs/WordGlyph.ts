import { Glyph, Point, Bounds } from '../core/Glyph';
import { IWindow, TextStyle} from '../core/IWindow';
import { CharacterGlyph } from './CharacterGlyph';

export class WordGlyph extends Glyph {
    private position: Point = { x: 0, y: 0 };
    private charGap: number = 0; // 词间距
    private style: TextStyle;
    

    constructor(chars: CharacterGlyph[], charGap: number = 0) {
        super();
        this.charGap = charGap;
        this.style = chars[0].getStyle(); // 所有字符样式相同
        for (const char of chars) this.insert(char);
    }

    get Text(): string {
        return this.children.map(child => (child as CharacterGlyph).Text).join('');
    }

    set Text(value: string) {
        const chars = value.split('').map(char => new CharacterGlyph(char, (this.children[0] as CharacterGlyph).getStyle()));
        this.children = chars;
    }

    setPosition(pos: Point) {
        this.position = pos;
    }

    layout(window: IWindow): void {
        let x = this.position.x;
        const y = this.position.y;
        for (const child of this.children as CharacterGlyph[]) {
            child.setPosition({ x, y });
            child.layout(window);
            x += child.getBounds().width + this.charGap; // 更新x坐标，添加字符间距
        }
    }

    draw(window: IWindow): void {
        if (this.children.length === 0) return;
    
        // 调用子类的绘制方法
        // for (const child of this.children) {
        //     child.draw(window);
        // }
    
        // 绘制文字
        window.drawText(this.Text, this.getBounds(), this.style);

        // // debug: 绘制边框
        // window.drawRect(this.getBounds(), {
        //     fillColor: 'rgba(0, 255, 0, 0.1)',
        //     strokeColor: 'red',
        //     lineWidth: 1
        // });
    }

    getBounds(): Bounds {
        if (this.children.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

        const first = this.children[0].getBounds();
        const last = this.children[this.children.length - 1].getBounds();

        const x = first.x;
        const y = Math.min(...this.children.map(c => c.getBounds().y)); // 计算最小y坐标

        const height = Math.max(...this.children.map(c => c.getBounds().height)); // 计算最大高度
        const width = last.x + last.width - x; // 计算总宽度

        return { x, y, width, height };
    }
}
