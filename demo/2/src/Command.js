import { Character } from "./Glyphs.js";

export class Command {
    constructor() {
        this.executed = false;
    }

    /**
     * Executes the command. Must be implemented by subclasses.
     */
    execute() {
        throw new Error('Abstract method: execute must be implemented by subclasses');
    }

    /**
     * Undoes the command. Must be implemented by subclasses if the command is reversible.
     */
    unexecute() {
        throw new Error('Abstract method: unexecute must be implemented by subclasses');
    }

    /**
     * Indicates if the command can be undone. Defaults to true.
     * @returns {boolean}
     */
    isReversible() {
        return true;
    }
}

export class CommandHistory {
    constructor() {
        this.history = [];
        this.present = -1;
    }

    /**
     * Executes a command and adds it to the history.
     * @param {Command} command - The command to execute.
     */
    execute(command) {
        // If we're not at the end of history, truncate future commands
        if (this.present < this.history.length - 1) {
            this.history = this.history.slice(0, this.present + 1);
        }

        command.execute();
        this.history.push(command);
        this.present = this.history.length - 1;
    }

    /**
     * Undoes the last executed command if possible.
     */
    undo() {
        if (this.present >= 0) {
            const command = this.history[this.present];
            if (command.isReversible()) {
                command.unexecute();
                this.present--;
            }
        }
    }

    /**
     * Redoes the last undone command if possible.
     */
    redo() {
        if (this.present < this.history.length - 1) {
            this.present++;
            const command = this.history[this.present];
            command.execute();
        }
    }

    /**
     * Checks if there are commands that can be undone.
     * @returns {boolean}
     */
    canUndo() {
        return this.present >= 0 && this.history[this.present].isReversible();
    }

    /**
     * Checks if there are commands that can be redone.
     * @returns {boolean}
     */
    canRedo() {
        return this.present < this.history.length - 1;
    }
}

// Concrete Command Classes
export class InsertCharacterCommand extends Command {
    constructor(composition, char, x, y, fontSize, fontFamily, color) {
        super();
        this.composition = composition;
        this.char = char;
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.color = color;
        this.insertedGlyph = null;
    }

    execute() {
        this.insertedGlyph = new Character(
            this.char,
            this.x,
            this.y,
            this.fontSize,
            this.fontFamily,
            this.color
        );
        this.composition.insert(this.insertedGlyph);
        this.executed = true;
    }

    unexecute() {
        if (this.executed && this.insertedGlyph) {
            this.composition.remove(this.insertedGlyph);
            this.insertedGlyph = null;
        }
    }
}

export class DeleteCharacterCommand extends Command {
    constructor(composition, glyphToDelete) {
        super();
        this.composition = composition;
        this.glyphToDelete = glyphToDelete;
        this.originalParent = null;
        this.originalIndex = -1;
    }

    execute() {
        if (this.glyphToDelete) {
            this.originalParent = this.glyphToDelete.getParent();
            if (this.originalParent) {
                this.originalIndex = this.originalParent.children.indexOf(this.glyphToDelete);
                this.originalParent.remove(this.glyphToDelete);
                this.executed = true;
            }
        }
    }

    unexecute() {
        if (this.executed && this.glyphToDelete && this.originalParent !== null && this.originalIndex !== -1) {
            this.originalParent.insert(this.glyphToDelete, this.originalIndex);
        }
    }
}

export class ChangeFontCommand extends Command {
    constructor(composition, glyph, newFontFamily, newFontSize, newColor) {
        super();
        this.composition = composition;
        this.glyph = glyph;
        this.newFontFamily = newFontFamily;
        this.newFontSize = newFontSize;
        this.newColor = newColor;
        this.originalFontFamily = null;
        this.originalFontSize = null;
        this.originalColor = null;
    }

    execute() {
        if (this.glyph instanceof Character) {
            this.originalFontFamily = this.glyph.fontFamily;
            this.originalFontSize = this.glyph.fontSize;
            this.originalColor = this.glyph.color;

            this.glyph.fontFamily = this.newFontFamily;
            this.glyph.fontSize = this.newFontSize;
            this.glyph.color = this.newColor;
            this.executed = true;
        }
    }

    unexecute() {
        if (this.executed && this.glyph instanceof Character) {
            this.glyph.fontFamily = this.originalFontFamily;
            this.glyph.fontSize = this.originalFontSize;
            this.glyph.color = this.originalColor;
        }
    }

    isReversible() {
        return this.glyph instanceof Character && (
            this.glyph.fontFamily !== this.newFontFamily ||
            this.glyph.fontSize !== this.newFontSize ||
            this.glyph.color !== this.newColor
        );
    }
}

export class ScrollCommand extends Command {
    constructor(scroller, dx, dy) {
        super();
        this.scroller = scroller;
        this.dx = dx;
        this.dy = dy;
        this.originalX = 0;
        this.originalY = 0;
    }

    execute() {
        this.originalX = this.scroller.scrollX;
        this.originalY = this.scroller.scrollY;
        this.scroller.scrollBy(this.dx, this.dy);
        this.executed = true;
    }

    unexecute() {
        if (this.executed) {
            this.scroller.scrollTo(this.originalX, this.originalY);
        }
    }
}