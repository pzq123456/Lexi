// CanvasKit Initialization
export const initCanvasKitEngine = async () => {
    const ckLoaded = CanvasKitInit({
      locateFile: (file) => `https://unpkg.com/canvaskit-wasm@0.19.0/bin/${file}`
    });
  
    const loadFont = fetch('https://storage.googleapis.com/skia-cdn/misc/Roboto-Regular.ttf')
      .then((response) => response.arrayBuffer());
  
    const [CanvasKit, robotoData] = await Promise.all([ckLoaded, loadFont]);
    return { CanvasKit, robotoData };
  };

// Canvas Drawing Application
export class CanvasKitApp {
    constructor(CanvasKit, robotoData) {
        this.CanvasKit = CanvasKit;
        this.robotoData = robotoData;
        this.angle = 0;
        this.centerX = 200;
        this.centerY = 200;
        this.radius = 150;
        this.growing = false;
        this.init();
    }

    init() {
        this.surface = this.CanvasKit.MakeCanvasSurface('demo');
        this.canvas = this.surface.getCanvas();
        this.fontMgr = this.CanvasKit.FontMgr.FromData([this.robotoData]);
        this.setupPaints();
        this.setupText();
        this.startAnimation();
        this.setupThemeObserver();
    }

    setupPaints() {
        this.rectPaint = new this.CanvasKit.Paint();
        this.rectPaint.setStyle(this.CanvasKit.PaintStyle.Fill);
        this.rectPaint.setAntiAlias(true);
    }

    createTextStyle(isDark) {
        return {
        fontFamilies: ['Roboto'],
        fontSize: 24,
        color: isDark ? this.CanvasKit.WHITE : this.CanvasKit.BLACK
        };
    }

    setupText() {
        const isDark = document.body.classList.contains('dark');
        this.textStyle = this.createTextStyle(isDark);
        
        this.paraStyle = new this.CanvasKit.ParagraphStyle({
        textStyle: this.textStyle,
        textAlign: this.CanvasKit.TextAlign.Center,
        });

        this.builder = this.CanvasKit.ParagraphBuilder.Make(this.paraStyle, this.fontMgr);
        this.builder.addText("CanvasKit Demo");
        this.paragraph = this.builder.build();
        this.paragraph.layout(380);
    }

    updateText() {
        // Clean up previous paragraph and builder
        if (this.paragraph) {
        this.paragraph.delete();
        }
        if (this.builder) {
        this.builder.delete();
        }

        const isDark = document.body.classList.contains('dark');
        this.textStyle = this.createTextStyle(isDark);
        
        this.paraStyle = new this.CanvasKit.ParagraphStyle({
        textStyle: this.textStyle,
        textAlign: this.CanvasKit.TextAlign.Center,
        });

        this.builder = this.CanvasKit.ParagraphBuilder.Make(this.paraStyle, this.fontMgr);
        this.builder.addText("CanvasKit Demo");
        this.paragraph = this.builder.build();
        this.paragraph.layout(380);
    }

    updateColors() {
        const isDark = document.body.classList.contains('dark');
        
        // Set colors based on theme
        const bgColor = isDark 
        ? this.CanvasKit.Color4f(0.1, 0.1, 0.1, 1.0) 
        : this.CanvasKit.Color4f(0.95, 0.95, 0.95, 1.0);
        
        const rectColor = isDark 
        ? this.CanvasKit.Color4f(0.8, 0.2, 0.2, 1.0) 
        : this.CanvasKit.Color4f(0.2, 0.3, 1, 1.0);

        // Update paints
        this.rectPaint.setColor(rectColor);
        this.updateText();
        this.canvas.clear(bgColor);
    }

    drawFrame = (canvas) => {
        this.updateColors();
        
        // Update animation state
        this.angle += 0.02;
        if (this.radius >= 180) this.growing = false;
        if (this.radius <= 120) this.growing = true;
        this.radius += this.growing ? 0.5 : -0.5;

        // Calculate rotating position
        const x = this.centerX + Math.cos(this.angle) * this.radius;
        const y = this.centerY + Math.sin(this.angle) * this.radius;

        // Draw elements
        const rr = this.CanvasKit.RRectXY(
        this.CanvasKit.LTRBRect(x - 50, y - 30, x + 50, y + 30),
        10, 10
        );
        canvas.drawRRect(rr, this.rectPaint);
        canvas.drawParagraph(this.paragraph, 10, 10);

        this.surface.requestAnimationFrame(this.drawFrame);
    }

    startAnimation() {
        this.surface.requestAnimationFrame(this.drawFrame);
    }

    setupThemeObserver() {
        new MutationObserver(() => this.updateColors())
        .observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    // Clean up resources
    cleanup() {
        if (this.paragraph) this.paragraph.delete();
        if (this.builder) this.builder.delete();
        if (this.fontMgr) this.fontMgr.delete();
        if (this.rectPaint) this.rectPaint.delete();
        if (this.surface) this.surface.delete();
    }
}
