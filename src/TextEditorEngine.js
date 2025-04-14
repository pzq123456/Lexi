export class TextEditorEngine {
    constructor(CanvasKit, fontMgr, maxWidth = 380) {
        this.CanvasKit = CanvasKit;
        this.fontMgr = fontMgr;
        this.maxWidth = maxWidth;

        this.textLines = [''];
        this.cursor = { line: 0, column: 0 };
        this.paragraph = null;
        this.builder = null;
        this.textStyle = null;

        this.cursorPaint = new this.CanvasKit.Paint();
        this.cursorPaint.setColor(this.CanvasKit.Color4f(0, 0, 0, 1));
    }

    setTextStyle(isDark) {
        this.textStyle = {
            fontFamilies: ['Roboto'],
            fontSize: 24,
            color: isDark ? this.CanvasKit.WHITE : this.CanvasKit.BLACK,
        };
    }

    buildParagraph() {
        if (this.paragraph) this.paragraph.delete();
        if (this.builder) this.builder.delete();

        this.builder = this.CanvasKit.ParagraphBuilder.Make(
            new this.CanvasKit.ParagraphStyle({
                textStyle: this.textStyle,
                textAlign: this.CanvasKit.TextAlign.Left,
            }),
            this.fontMgr
        );

        const fullText = this.textLines.join('\n');
        this.builder.addText(fullText);

        this.paragraph = this.builder.build();
        this.paragraph.layout(this.maxWidth);
    }

    insertText(text) {
        const line = this.textLines[this.cursor.line];
        this.textLines[this.cursor.line] =
            line.slice(0, this.cursor.column) + text + line.slice(this.cursor.column);
        this.cursor.column += text.length;
        this.buildParagraph();
    }

    deleteChar() {
        const line = this.textLines[this.cursor.line];
        if (this.cursor.column > 0) {
            this.textLines[this.cursor.line] =
                line.slice(0, this.cursor.column - 1) + line.slice(this.cursor.column);
            this.cursor.column--;
        } else if (this.cursor.line > 0) {
            const prevLine = this.textLines[this.cursor.line - 1];
            this.cursor.column = prevLine.length;
            this.textLines[this.cursor.line - 1] += line;
            this.textLines.splice(this.cursor.line, 1);
            this.cursor.line--;
        }
        this.buildParagraph();
    }

    newLine() {
        const line = this.textLines[this.cursor.line];
        const before = line.slice(0, this.cursor.column);
        const after = line.slice(this.cursor.column);
        this.textLines[this.cursor.line] = before;
        this.textLines.splice(this.cursor.line + 1, 0, after);
        this.cursor.line++;
        this.cursor.column = 0;
        this.buildParagraph();
    }
    
    draw(canvas, x = 10, y = 10, showCursor = true) {
        canvas.drawParagraph(this.paragraph, x, y);
    
        if (!showCursor) return;
    
        const lineHeight = this.textStyle.fontSize * 1.2; // approximate line height
        const cursorY = y + this.cursor.line * lineHeight;
    
        // Estimate X position by measuring width of current line text up to cursor
        const tempBuilder = this.CanvasKit.ParagraphBuilder.Make(
            new this.CanvasKit.ParagraphStyle({ textStyle: this.textStyle }),
            this.fontMgr
        );
        const textUpToCursor = this.textLines[this.cursor.line].slice(0, this.cursor.column);
        tempBuilder.addText(textUpToCursor);
        const tempPara = tempBuilder.build();
        tempPara.layout(this.maxWidth);
        const cursorX = tempPara.getMaxIntrinsicWidth();
    
        canvas.drawRect(
            this.CanvasKit.LTRBRect(x + cursorX, cursorY, x + cursorX + 2, cursorY + lineHeight),
            this.cursorPaint
        );
    
        tempPara.delete();
        tempBuilder.delete();
    }
    

    cleanup() {
        if (this.paragraph) this.paragraph.delete();
        if (this.builder) this.builder.delete();
        if (this.cursorPaint) this.cursorPaint.delete();
    }
}
