// ./src/InputHandler.js
import { InsertCharacterCommand, DeleteCharacterCommand } from './Command.js';
import { Space, Character } from './Glyphs.js';

export class InputHandler {
    constructor(composition, cursor, commandHistory, redrawCallback) {
        this.composition = composition;
        this.cursor = cursor;
        this.commandHistory = commandHistory;
        this.redraw = redrawCallback;
    }

    handleKeyDown(event) {
        if (event.key.length === 1) { // 字符输入
            this.insertCharacter(event.key);
            event.preventDefault();
        } else if (event.key === 'Backspace') {
            this.deleteCharacterBeforeCursor();
            event.preventDefault();
        } else if (event.key === 'Enter') {
            this.insertCharacter('\n');
            event.preventDefault();
        } else if (event.key === 'ArrowLeft') {
            this.moveCursorLeft();
        } else if (event.key === 'ArrowRight') {
            this.moveCursorRight();
        } else if (event.key === 'ArrowUp') {
            this.moveCursorUp();
        } else if (event.key === 'ArrowDown') {
            this.moveCursorDown();
        } else if (event.ctrlKey && event.key === 'z') {
            this.commandHistory.undo();
            this.composition.compose();
            this.redraw();
        } else if (event.ctrlKey && event.key === 'y') {
            this.commandHistory.redo();
            this.composition.compose();
            this.redraw();
        }
    }

    handleMouseDown(event) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.setCursorPosition(x, y);
    }

    insertCharacter(char) {
        const insertCmd = new InsertCharacterCommand(
            this.composition, char, this.cursor.x, this.cursor.y, 18, 'Arial', '#333'
        );
        this.commandHistory.execute(insertCmd);
        this.composition.insert(new Space(5, 2, 18)); // Add space after each character for simple layout
        this.composition.compose(); // 重新布局
        // Simple cursor right move (needs better logic based on layout)
        this.cursor.moveBy(char === '\n' ? 0 : 10, char === '\n' ? 18 : 0);
        this.redraw();
    }

    deleteCharacterBeforeCursor() {
        // Simple deletion of the last character (needs better cursor awareness)
        if (this.composition.getChildCount() > 1) { // Ensure there's more than just the initial space
            const lastGlyph = this.composition.child(this.composition.getChildCount() - 2); // Get the character
            const spaceToRemove = this.composition.child(this.composition.getChildCount() - 1); // Get the trailing space

            if (lastGlyph instanceof Character) {
                const deleteCmd = new DeleteCharacterCommand(
                    this.composition, lastGlyph
                );
                this.commandHistory.execute(deleteCmd);
                this.composition.remove(spaceToRemove); // Remove the trailing space
                this.composition.compose();
                this.cursor.moveBy(-10, 0); // Simple cursor left move
                this.redraw();
            }
        }
    }

    moveCursorLeft() {
        this.cursor.moveBy(-10, 0);
        this.redraw();
    }

    moveCursorRight() {
        this.cursor.moveBy(10, 0);
        this.redraw();
    }

    moveCursorUp() {
        this.cursor.moveBy(0, -18);
        this.redraw();
    }

    moveCursorDown() {
        this.cursor.moveBy(0, 18);
        this.redraw();
    }

    setCursorPosition(x, y) {
        this.cursor.moveTo(x, y);
        this.redraw();
    }
}