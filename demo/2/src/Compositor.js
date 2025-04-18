// ./src/Compositor.js
import { Character, Row, Column, Space, Rectangle } from "./Glyphs.js";
import { Glyph } from "./Glyph.js";

// Abstract base class for all compositors
export class Compositor {
  compose(composition) {
      throw new Error("Abstract method: compose must be implemented by subclasses");
  }

  removeStructureGlyphs(composition) {
      for (let i = composition.children.length - 1; i >= 0; i--) {
          const glyph = composition.child(i);
          if (glyph instanceof Row) {
              composition.remove(glyph);
          }
      }
  }
}

// Simple compositor that does basic line breaking
export class SimpleCompositor extends Compositor {
  constructor(options = {}) {
      super();
      this.lineWidth = options.lineWidth || 500;
      this.lineSpacing = options.lineSpacing || 30;
      this.glyphSpacing = options.glyphSpacing || 0; // 字母之间的默认间距
      this.wordSpacing = options.wordSpacing || 10;   // 单词之间的默认间距
  }

  compose(composition) {
      this.removeStructureGlyphs(composition);

      let currentX = 0;
      let currentY = 0;
      let currentRow = new Row(this.glyphSpacing);
      composition.insert(currentRow);

      for (let i = 0; i < composition.children.length; i++) {
          const glyph = composition.child(i);

          if (glyph instanceof Row) continue; // Skip existing rows

          const bounds = glyph.bounds();
          const glyphWidth = bounds.x1 - bounds.x0;
          const spacing = glyph instanceof Space ? this.wordSpacing : this.glyphSpacing;
          const requiredSpace = glyphWidth + (currentRow.getChildCount() > 0 ? spacing : 0);

          if (currentX + requiredSpace > this.lineWidth) {
              currentY += this.lineSpacing;
              currentRow = new Row(this.glyphSpacing);
              composition.insert(currentRow);
              currentX = 0;
          }

          // For Characters and Rectangles, update their local position within the Row
          if (glyph instanceof Character || glyph instanceof Rectangle) {
              glyph.x = currentX;
              glyph.y = 0; // Relative to the Row
          }

          currentRow.insert(glyph);
          currentX += glyphWidth + spacing;
      }
  }
}

// TeX compositor with more sophisticated layout (justification)
export class TeXCompositor extends Compositor {
  constructor(options = {}) {
      super();
      this.lineWidth = options.lineWidth || 500;
      this.lineSpacing = options.lineSpacing || 30;
      this.justify = options.justify || true;
      this.glyphSpacing = options.glyphSpacing || 0; // 字母之间的默认间距
      this.wordSpacing = options.wordSpacing || 10;   // 单词之间的默认间距
  }

  compose(composition) {
      this.removeStructureGlyphs(composition);

      let currentX = 0;
      let currentY = 0;
      let currentRow = new Row();
      composition.insert(currentRow);
      let currentLineGlyphs = [];

      for (let i = 0; i < composition.children.length; i++) {
          const glyph = composition.child(i);

          if (glyph instanceof Row) continue; // Skip existing rows

          const bounds = glyph.bounds();
          const glyphWidth = bounds.x1 - bounds.x0;
          const spacing = glyph instanceof Space ? this.wordSpacing : this.glyphSpacing;
          const requiredSpace = glyphWidth + (currentLineGlyphs.length > 0 ? spacing : 0);

          if (currentX + requiredSpace > this.lineWidth && currentLineGlyphs.length > 0) {
              this.layoutLine(currentRow, currentLineGlyphs);
              currentY += this.lineSpacing;
              currentRow = new Row();
              composition.insert(currentRow);
              currentLineGlyphs = [];
              currentX = 0;
              // Re-evaluate the current glyph in the new line
              i--;
              continue;
          }

          // For Characters and Rectangles, their position will be determined in layoutLine
          currentLineGlyphs.push(glyph);
          currentX += glyphWidth + spacing;
      }

      // Layout the last line
      if (currentLineGlyphs.length > 0) {
          this.layoutLine(currentRow, currentLineGlyphs);
      }
  }

  layoutLine(row, glyphs) {
      let totalWidth = 0;
      const spaces = glyphs.filter(g => g instanceof Space);
      const nonSpaces = glyphs.filter(g => !(g instanceof Space));

      // Calculate total width of non-space glyphs and initial space widths
      nonSpaces.forEach(glyph => {
          totalWidth += glyph.bounds().x1 - glyph.bounds().x0 + this.glyphSpacing;
      });
      spaces.forEach(space => {
          totalWidth += space.bounds().x1 - space.bounds().x0;
      });
      if (nonSpaces.length > 0) {
          totalWidth -= this.glyphSpacing; // Remove extra spacing after the last non-space glyph
      }

      const remainingSpace = this.lineWidth - totalWidth;
      const numSpaces = spaces.length;
      const spaceIncrement = numSpaces > 0 && this.justify ? remainingSpace / numSpaces : 0;

      let currentX = 0;
      glyphs.forEach(glyph => {
          const bounds = glyph.bounds();
          const glyphWidth = bounds.x1 - bounds.x0;
          glyph.x = currentX;
          glyph.y = 0; // Relative to the Row
          row.insert(glyph);
          currentX += glyphWidth + (glyph instanceof Space ? (glyph.bounds().x1 - glyph.bounds().x0 + spaceIncrement) : this.glyphSpacing);
      });
  }
}

export class Composition extends Glyph {
  constructor(compositor, options = {}) {
      super();
      this.compositor = compositor;
      this.width = options.width || 800;
      this.height = options.height || 600;
      this.margin = options.margin || 40;
  }

  setCompositor(compositor) {
      this.compositor = compositor;
  }

  compose() {
      if (this.compositor) {
          this.compositor.compose(this);
      }
  }

  draw(window, offsetX = 0, offsetY = 0) {
      window.save();
      window.setStrokeStyle('gray');
      window.strokeRect(offsetX, offsetY, this.width, this.height);

      window.setStrokeStyle('lightgray');
      window.strokeRect(
          offsetX + this.margin,
          offsetY + this.margin,
          this.width - 2 * this.margin,
          this.height - 2 * this.margin
      );

      window.restore();

      this.children.forEach(child => child.draw(window, offsetX + this.margin, offsetY + this.margin));
  }

  bounds() {
      return {
          x0: 0,
          y0: 0,
          x1: this.width,
          y1: this.height
      };
  }

  intersects(point) {
      return point.x >= this.margin && point.x <= this.width - this.margin &&
             point.y >= this.margin && point.y <= this.height - this.margin;
  }
}