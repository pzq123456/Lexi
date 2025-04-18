/**
 * @abstract
 * @class Glyph
 * @classdesc Abstract base class for all glyphs.
 * This class defines the interface for drawing, calculating bounds, and checking intersections.
 * It also manages child glyphs.
 * Subclasses must implement the draw, bounds, and intersects methods.
 */
export class Glyph {
    constructor() {
        this.parent = null;
        this.children = [];
    }

    /**
     * Drawing operation (to be implemented by subclasses)
     * @param {DemoWindow} window - The drawing context.
     * @param {number} [offsetX=0] - The horizontal offset for drawing.
     * @param {number} [offsetY=0] - The vertical offset for drawing.
     */
    draw(window, offsetX = 0, offsetY = 0) {
        throw new Error('Abstract method: draw must be implemented by subclasses');
    }

    /**
     * Returns the bounds of the glyph { x0, y0, x1, y1 }
     * @returns {{x0: number, y0: number, x1: number, y1: number}}
     */
    bounds() {
        throw new Error('Abstract method: bounds must be implemented by subclasses');
    }

    /**
     * Checks if a point intersects with the glyph
     * @param {{x: number, y: number}} point - The point to check.
     * @returns {boolean}
     */
    intersects(point) {
        throw new Error('Abstract method: intersects must be implemented by subclasses');
    }

    /**
     * Child management: insert a glyph
     * @param {Glyph} glyph - The glyph to insert.
     * @param {number} [index] - The index at which to insert. If undefined, inserts at the end.
     */
    insert(glyph, index) {
        if (index === undefined) {
            index = this.children.length;
        }
        glyph.parent = this;
        this.children.splice(index, 0, glyph);
    }

    /**
     * Child management: remove a glyph
     * @param {Glyph} glyph - The glyph to remove.
     * @returns {boolean} - True if the glyph was removed, false otherwise.
     */
    remove(glyph) {
        const index = this.children.indexOf(glyph);
        if (index !== -1) {
            glyph.parent = null;
            this.children.splice(index, 1);
        }
        return index !== -1;
    }

    /**
     * Access a child glyph by index
     * @param {number} index - The index of the child.
     * @returns {Glyph | undefined}
     */
    child(index) {
        return this.children[index];
    }

    /**
     * Returns the parent glyph
     * @returns {Glyph | null}
     */
    getParent() {
        return this.parent;
    }

    /**
     * Returns the number of children
     * @returns {number}
     */
    getChildCount() {
        return this.children.length;
    }

    /**
     * Helper method to calculate composite bounds of children
     * @returns {{x0: number, y0: number, x1: number, y1: number}}
     */
    calculateCompositeBounds() {
        if (this.children.length === 0) {
            return { x0: 0, y0: 0, x1: 0, y1: 0 };
        }

        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;

        this.children.forEach(child => {
            const bounds = child.bounds();
            x0 = Math.min(x0, bounds.x0);
            y0 = Math.min(y0, bounds.y0);
            x1 = Math.max(x1, bounds.x1);
            y1 = Math.max(y1, bounds.y1);
        });

        return { x0, y0, x1, y1 };
    }
}

/**
 * @class MonoGlyph
 * @extends Glyph
 * @classdesc Abstract base class for glyph decorators.
 * Implements transparent enclosure by forwarding all operations to a single component.
 */
export class MonoGlyph extends Glyph {
    constructor(component) {
        super();
        this.component = component;
        component.parent = this;
    }

    draw(window, offsetX = 0, offsetY = 0) {
        this.component.draw(window, offsetX, offsetY);
    }

    bounds() {
        return this.component.bounds();
    }

    intersects(point) {
        return this.component.intersects(point);
    }

    insert(glyph, index) {
        this.component.insert(glyph, index);
    }

    remove(glyph) {
        return this.component.remove(glyph);
    }

    child(index) {
        return this.component.child(index);
    }

    getChildCount() {
        return this.component.getChildCount();
    }
}