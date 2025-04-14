import { ThemeManager } from "./src/ThemeManager.js";
import { initCanvasKitEngine } from "./src/CanvasKitApp.js";
import { TextEditorEngine } from "./src/TextEditorEngine.js";

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme
    const themeManager = new ThemeManager();

    try {
        const { CanvasKit, robotoData } = await initCanvasKitEngine();

        // Setup surface and canvas
        const surface = CanvasKit.MakeCanvasSurface('demo');
        if (!surface) throw new Error("Canvas surface creation failed.");
        const canvas = surface.getCanvas();

        // Load font manager
        const fontMgr = CanvasKit.FontMgr.FromData([robotoData]);

        // Create text editor engine
        const editor = new TextEditorEngine(CanvasKit, fontMgr);
        editor.setTextStyle(document.body.classList.contains('dark'));
        editor.buildParagraph();

        // Cursor blink state (optional)
        let showCursor = true;
        setInterval(() => {
            showCursor = !showCursor;
        }, 500);

        // Animation loop
        const drawFrame = () => {
            const isDark = document.body.classList.contains('dark');
            const bgColor = isDark
                ? CanvasKit.Color4f(0.1, 0.1, 0.1, 1.0)
                : CanvasKit.Color4f(0.95, 0.95, 0.95, 1.0);

            canvas.clear(bgColor);
            editor.setTextStyle(isDark);
            editor.buildParagraph();
            editor.draw(canvas, 10, 10, showCursor);
            surface.requestAnimationFrame(drawFrame);
        };
        surface.requestAnimationFrame(drawFrame);

        // Setup input handling
        const input = document.createElement('input');
        input.style.position = 'absolute';
        input.style.opacity = 0;
        input.autofocus = true;
        document.body.appendChild(input);
        input.focus();

        input.addEventListener('input', (e) => {
            if (e.data) editor.insertText(e.data);
            input.value = 'jk';
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                e.preventDefault();
                editor.deleteChar();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                editor.newLine();
            }
        });

        // Update on theme change
        new MutationObserver(() => {
            editor.setTextStyle(document.body.classList.contains('dark'));
            editor.buildParagraph();
        }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

        // Cleanup
        window.addEventListener('beforeunload', () => {
            editor.cleanup();
            surface.delete();
        });

    } catch (error) {
        console.error('Failed to initialize CanvasKit:', error);
    }
});
