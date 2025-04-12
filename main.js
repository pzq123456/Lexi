import { DemoWindow } from './src/DemoWindow.js';
import { Character, Space, Border, Scroller, MenuItem, Cursor, Row } from './src/Glyphs.js';
import { SimpleCompositor, Composition } from './src/Compositor.js';
import { CommandHistory, InsertCharacterCommand, DeleteCharacterCommand, ChangeFontCommand, ScrollCommand } from './src/Command.js';
import { InputHandler } from './src/InputHandler.js';

// Initialize Canvas and DemoWindow
const canvas = document.getElementById('demoCanvas');
const demoWindow = new DemoWindow(canvas);
demoWindow.width = 600;
demoWindow.height = 300;

// Initialize Composition and Compositor
const compositor = new SimpleCompositor({ lineWidth: 1000, lineSpacing: 25, wordSpacing: 15 });
const composition = new Composition(compositor, { 
    width: 600,
    height: 300,
});

// Add initial content
const initialText = "Hello World! This is a simple text composition demo. Try typing something!";

initialText.split('').forEach((char, index) => {
    const character = new Character(char, 0, 0, 18, 'Arial', '#333');
    composition.insert(character);
    if (char !== ' ') {
        composition.insert(new Space(5, 2, 18)); // Add space after each character for simple layout     
    }
});

composition.compose();

// Initialize Cursor - position it at the start of the composition
const firstCharBounds = composition.children[0]?.bounds() || { x0: 0, y0: 0 };
const cursor = new Cursor(
    firstCharBounds.x0 + composition.margin,
    firstCharBounds.y0 + composition.margin
);

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
    new MenuItem('Change Font', () => {
        const firstChar = composition.children.find(child => child instanceof Character);
        if (firstChar) {
            commandHistory.execute(new ChangeFontCommand(firstChar, 'Courier New', 20, 'green'));
        }
    }),
    new MenuItem('Scroll Down', () => commandHistory.execute(new ScrollCommand(scroller, 0, 50))),
    new MenuItem('Scroll Up', () => commandHistory.execute(new ScrollCommand(scroller, 0, -50))),
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
    
    // Draw highlight for selected row
    if (selectedRow) {
        const bounds = selectedRow.bounds();
        demoWindow.save();
        demoWindow.setFillStyle(highlightColor);
        demoWindow.fillRect(
            bounds.x0 - scroller.scrollX, 
            bounds.y0 - scroller.scrollY, 
            bounds.x1 - bounds.x0, 
            bounds.y1 - bounds.y0
        );
        demoWindow.restore();
    }
    
    borderedScroller.draw(demoWindow, 0, 0);
    
    // Draw cursor relative to scrolled position
    demoWindow.save();
    demoWindow.translate(-scroller.scrollX, -scroller.scrollY);
    cursor.draw(demoWindow, cursor.x, cursor.y);
    demoWindow.restore();
    
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
            item.click();
            redraw();
            return;
        }
    }

    // Handle focus on canvas for keyboard input
    canvas.focus();
    inputHandler.handleMouseDown(event);

    // Find clicked row
    const contentPoint = {
        x: point.x - 20 + scroller.scrollX,
        y: point.y - 60 + scroller.scrollY
    };

    selectedRow = findRowAtPoint(composition, contentPoint);
    redraw();
});

function findRowAtPoint(glyph, point) {
    if (glyph instanceof Row && glyph.intersects(point)) {
        return glyph;
    }
    if (glyph.children) {
        for (const child of glyph.children) {
            const found = findRowAtPoint(child, point);
            if (found) return found;
        }
    }
    return null;
}

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
    event.preventDefault();
    scroller.scrollBy(event.deltaX, event.deltaY);
    redraw();
}, { passive: false });

// Start the animation loop
gameLoop();