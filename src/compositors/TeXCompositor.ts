import { CharacterGlyph } from '../glyphs/CharacterGlyph';
import { WordGlyph } from '../glyphs/WordGlyph';
import { LineGlyph } from '../glyphs/LineGlyph';
import { ColumnGlyph } from '../glyphs/ColumnGlyph';
import { isAlphabet, isChinese, isPunctuation } from "./utils";
import { IWindow } from '../core/IWindow';

// 提供最基础的 line break 和 word break 功能
// 只会做简单的换行，不会考虑复杂的排版规则

export class TeXCompositor{

    private columnWidth: number;
    private columnHeight: number;
    private chars: CharacterGlyph[] = [];
    private words: WordGlyph[] = [];
    private lines: LineGlyph[] = [];
    private columns: ColumnGlyph[] = [];
    private window: IWindow;
    private lineGap: number = 10;


    constructor(
        chars: CharacterGlyph[],
        window: IWindow,
        columnWidth: number = 793,
        columnHeight: number = 1122,
        lineGap: number = 10
    ) {
        this.chars = chars;
        this.window = window;
        this.columnWidth = columnWidth;
        this.columnHeight = columnHeight;
        this.lineGap = lineGap;
    }

    Compose(): ColumnGlyph[] {
        this.tokenizeCharacters();
        this.layoutParagraph();
        this.createColumns();

        return this.columns;
    }

    private tokenizeCharacters(): void {
        let buffer: CharacterGlyph[] = [];

        const flushBuffer = () => {
            if (buffer.length > 0) {
                this.words.push(new WordGlyph(buffer));
                buffer = [];
            }
        };

        const getLanguage = (char: string): 'chinese' | 'alphabet' | 'other' => {
            if (isChinese(char)) return 'chinese';
            if (isAlphabet(char)) return 'alphabet';
            return 'other';
        };

        for (let i = 0; i < this.chars.length; i++) {
            const char = this.chars[i];
            const text = char.getText();

            if (isChinese(text)) {
                flushBuffer();
                this.words.push(new WordGlyph([char]));
                continue;
            }

            if (isPunctuation(text) || text === ' ') {
                flushBuffer();
                this.words.push(new WordGlyph([char]));
                continue;
            }

            const lang = getLanguage(text);
            const style = char.getStyle();

            if (buffer.length === 0) {
                buffer.push(char);
                continue;
            }

            const last = buffer[buffer.length - 1];
            const lastLang = getLanguage(last.getText());
            const lastStyle = last.getStyle();

            const sameLang = lang === lastLang;
            const sameStyle = JSON.stringify(style) === JSON.stringify(lastStyle);

            if (!sameLang || !sameStyle) {
                flushBuffer();
            }

            buffer.push(char);
        }

        flushBuffer();
    }

    private layoutParagraph(
        maxWidth: number = this.columnWidth,
    ): void {
        let currentLine = new LineGlyph();
        let currentX = 0;
        let maxLineHeight = 0;

        for (const word of this.words) {
            word.layout(this.window);
            const bounds = word.getBounds();
            const wordWidth = bounds.width;
            const wordHeight = bounds.height;

            maxLineHeight = Math.max(maxLineHeight, wordHeight);

            if (currentX + wordWidth > maxWidth) {
                this.lines.push(currentLine);
                currentLine = new LineGlyph();
                currentX = 0;
                maxLineHeight = 0;
                
                maxLineHeight = Math.max(maxLineHeight, word.getBounds().height);
            }

            currentLine.insert(word);
            currentX += wordWidth + (isChinese(word.Text) ? 0 : 5);
        }

        if (currentLine.childrenLength > 0) {
            this.lines.push(currentLine);
        }
    }

    private createColumns(
        columnHeight: number = this.columnHeight,
    ): void {
        let currentColumn = new ColumnGlyph(this.lineGap);
        let currentY = 0;

        for (const line of this.lines) {
            const bounds = line.getBounds();
            const lineHeight = bounds.height;

            if (currentY + lineHeight > columnHeight) {
                this.columns.push(currentColumn);
                currentColumn = new ColumnGlyph(this.lineGap);
                currentY = 0;
            }

            currentColumn.insert(line);
            currentY += lineHeight + this.lineGap;
        }

        if (currentColumn.childrenLength > 0) {
            this.columns.push(currentColumn);
        }
    }
}