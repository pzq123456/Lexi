import { DemoWindow } from './src/DemoWindow.js';
import { Character, Space, Border, Scroller, MenuItem, Cursor, Row } from './src/Glyphs.js';
import { SimpleCompositor, Composition } from './src/Compositor.js';
import { CommandHistory, InsertCharacterCommand, DeleteCharacterCommand, ChangeFontCommand, ScrollCommand } from './src/Command.js';
import { InputHandler } from './src/InputHandler.js';

// Initialize Canvas and DemoWindow
const canvas = document.getElementById('demoCanvas');
const demoWindow = new DemoWindow(canvas);
demoWindow.width = 1200;
demoWindow.height = 800;

// Initialize Composition and Compositor
const compositor = new SimpleCompositor({ lineWidth: 1000, lineSpacing: 25, wordSpacing: 15 });
const composition = new Composition(compositor, { width: demoWindow.width - 80, height: demoWindow.height - 100, margin: 20 });

// Add initial content
const initialText = "Hello World! This is a simple text composition demo.\nTry typing something!";
initialText.split('').forEach(char => {
    composition.insert(new Character(char, 0, 0, 18, 'Arial', '#333'));
    if (char === '\n') {
        composition.insert(new Space(0, 0, 0, 18)); // Add a zero-width space after newline for layout
    } else {
        composition.insert(new Space(5, 2, 18));
    }
});
if (composition.children.length > 0 && composition.children[composition.children.length - 1] instanceof Space) {
    composition.children.pop(); // Remove the last extra space if it's a space
}
composition.compose();

// Initialize Cursor
const cursor = new Cursor(composition.bounds().x0 + composition.margin, composition.bounds().y0 + composition.margin + 18);

// Decorate with scrolling and border
const scroller = new Scroller(composition, {
    viewportWidth: demoWindow.width - 40,
    viewportHeight: demoWindow.height - 80,
    scrollX: 0,
    scrollY: 0
});

const borderedScroller = new Border(scroller, {
    color: 'blue',
    thickness: 2,
    margin: 20
});

// Initialize Command History
const commandHistory = new CommandHistory();

// Initialize Input Handler
const inputHandler = new InputHandler(composition, cursor, commandHistory, redraw);

// Initialize Menu Items
const menuItems = [
    new MenuItem('Undo', () => commandHistory.undo()),
    new MenuItem('Redo', () => commandHistory.redo()),
    new MenuItem('Change Font', new ChangeFontCommand(
        composition.children.find(child => child instanceof Character), 'Courier New', 20, 'green' // Example: change font of the first Character glyph
    )),
    new MenuItem('Scroll Down', new ScrollCommand(scroller, 0, 50)),
    new MenuItem('Scroll Up', new ScrollCommand(scroller, 0, -50)),
];

// Position Menu Items
let menuY = 20;
menuItems.forEach(item => {
    item.x = 20;
    item.y = menuY;
    menuY += item.height + 10;
});

// Selected Row for Highlighting
let selectedRow = null;
const highlightColor = 'rgba(255, 255, 0, 0.3)';

function redraw() {
    demoWindow.clear();

    // Draw bordered scroller (content area)
    demoWindow.save();
    demoWindow.translate(20, 60);
    if (selectedRow) {
        const bounds = selectedRow.bounds();
        demoWindow.save();
        demoWindow.setFillStyle(highlightColor);
        demoWindow.fillRect(bounds.x0 - scroller.scrollX, bounds.y0 - scroller.scrollY, bounds.x1 - bounds.x0, bounds.y1 - bounds.y0);
        demoWindow.restore();
    }
    borderedScroller.draw(demoWindow, 0, 0);
    cursor.draw(demoWindow, cursor.x - scroller.scrollX, cursor.y - scroller.scrollY);
    demoWindow.restore();

    // Draw menu items
    menuItems.forEach(item => item.draw(demoWindow));
}

let animationFrameId;

function gameLoop() {
    redraw();
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Event Listeners
canvas.tabIndex = 0;
canvas.focus();

canvas.addEventListener('keydown', (event) => {
    inputHandler.handleKeyDown(event);
});

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };

    // Check for menu item clicks
    for (const item of menuItems) {
        if (item.intersects(point)) {
            let commandOrAction = item.click();
            if (typeof commandOrAction.execute === 'function') {
                commandHistory.execute(commandOrAction);
            } else if (typeof commandOrAction === 'function') {
                commandOrAction();
            }
            redraw();
            return;
        }
    }

    // Handle focus on canvas for keyboard input
    canvas.focus();
    inputHandler.handleMouseDown(event); // Pass mousedown event to input handler for cursor positioning

    // Simple row selection on click within the content area
    const contentBounds = borderedScroller.bounds();
    const scrollX = scroller.scrollX;
    const scrollY = scroller.scrollY;
    const adjustedPoint = { x: point.x - (rect.left + 20) + scrollX, y: point.y - (rect.top + 60) + scrollY };

    function findRowAtPoint(glyph, point) {
        if (glyph instanceof Row && glyph.intersects(point)) {
            return glyph;
        }
        if (glyph.children) {
            for (const child of glyph.children) {
                const found = findRowAtPoint(child, point);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    selectedRow = findRowAtPoint(composition, adjustedPoint);
    redraw();
});

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };

    let needsRedraw = false;
    for (const item of menuItems) {
        const prevHovered = item.isHovered;
        item.isHovered = item.intersects(point);
        if (item.isHovered !== prevHovered) {
            needsRedraw = true;
        }
    }
    if (needsRedraw) {
        redraw();
    }
});

canvas.addEventListener('wheel', (event) => {
    event.preventDefault(); // Prevent default scrolling
    scroller.scrollBy(event.deltaX, event.deltaY);
    redraw();
}, { passive: false });

// Start the animation loop
animationFrameId = requestAnimationFrame(gameLoop);