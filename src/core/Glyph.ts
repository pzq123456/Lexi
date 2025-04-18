import { IWindow } from './IWindow.ts';

export interface Point {
    x: number;
    y: number;
}

export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Abstract class representing a graphical object (Glyph).
 */
export abstract class Glyph {
    private parent: Glyph | null = null;
    protected children: Glyph[] = [];

    abstract draw(window: IWindow): void;
    abstract getBounds(): Bounds;

    intersects(point: Point): boolean {
        const bounds = this.getBounds();
        return point.x >= bounds.x && 
               point.x <= bounds.x + bounds.width &&
               point.y >= bounds.y && 
               point.y <= bounds.y + bounds.height;
    }

    insert(child: Glyph, index: number = this.children.length): void {
        this.children.splice(index, 0, child);
        child.parent = this;
    }

    remove(child: Glyph): boolean {
        const index = this.children.indexOf(child);
        if (index === -1) return false;
        
        this.children.splice(index, 1);
        child.parent = null;
        return true;
    }

    getChild(index: number): Glyph | null {
        return this.children[index] ?? null;
    }

    getParent(): Glyph | null {
        return this.parent;
    }

    get childrenLength(): number {
        return this.children.length;
    }
}