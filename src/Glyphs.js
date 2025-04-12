import { Glyph, MonoGlyph } from './Glyph.js';

// Primitive Glyphs ==============================================
export class Rectangle extends Glyph {
    constructor(x0, y0, x1, y1, color = 'black') {
        super();
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
        this.color = color;
    }

    draw(window, offsetX = 0, offsetY = 0) {
        window.save();
        window.setFillStyle(this.color);
        window.fillRect(this.x0 + offsetX, this.y0 + offsetY, this.x1 - this.x0, this.y1 - this.y0);
        window.restore();
    }

    bounds() {
        return {
            x0: this.x0,
            y0: this.y0,
            x1: this.x1,
            y1: this.y1
        };
    }

    intersects(point) {
        return point.x >= this.x0 && point.x <= this.x1 &&
               point.y >= this.y0 && point.y <= this.y1;
    }
}

export class Character extends Glyph {
    constructor(char, x, y, fontSize = 12, fontFamily = 'Arial', color = 'black') {
        super();
        this.char = char;
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.color = color;
    }

    draw(window, offsetX = 0, offsetY = 0) {
        window.save();
        window.setFont(`${this.fontSize}px ${this.fontFamily}`);
        window.setFillStyle(this.color);
        window.fillText(this.char, this.x + offsetX, this.y + offsetY);
        window.restore();
    }

    bounds() {
        // Note: In a real implementation, you'd measure text metrics
        const width = this.fontSize * 0.6;
        const height = this.fontSize;
        return {
            x0: this.x,
            y0: this.y - height,
            x1: this.x + width,
            y1: this.y
        };
    }

    intersects(point) {
        const b = this.bounds();
        return point.x >= b.x0 && point.x <= b.x1 &&
               point.y >= b.y0 && point.y <= b.y1;
    }
}

export class Image extends Glyph {
    constructor(src, x, y, width, height) {
        super();
        this.src = src;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = src;
        this.loaded = false;

        this.image.onload = () => {
            this.loaded = true;
        };
    }

    draw(window, offsetX = 0, offsetY = 0) {
        if (this.loaded) {
            window.drawImage(this.image, this.x + offsetX, this.y + offsetY, this.width, this.height);
        }
    }

    bounds() {
        return {
            x0: this.x,
            y0: this.y,
            x1: this.x + this.width,
            y1: this.y + this.height
        };
    }

    intersects(point) {
        return point.x >= this.x && point.x <= this.x + this.width &&
               point.y >= this.y && point.y <= this.y + this.height;
    }
}

// Structural Glyphs =============================================
export class Row extends Glyph {
    constructor(spacing = 0) {
        super();
        this.spacing = spacing;
    }

    draw(window, offsetX = 0, offsetY = 0) {
        let currentX = 0;
        this.children.forEach(child => {
            child.draw(window, offsetX + currentX, offsetY);
            currentX += child.bounds().x1 - child.bounds().x0 + this.spacing;
        });
    }

    bounds() {
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        let currentX = 0;
        this.children.forEach(child => {
            const b = child.bounds();
            x0 = Math.min(x0, currentX + b.x0);
            y0 = Math.min(y0, b.y0);
            x1 = Math.max(x1, currentX + b.x1);
            y1 = Math.max(y1, b.y1);
            currentX += b.x1 - b.x0 + this.spacing;
        });
        return { x0: x0 === Infinity ? 0 : x0, y0: y0 === Infinity ? 0 : y0, x1: x1 === -Infinity ? 0 : x1, y1: y1 === -Infinity ? 0 : y1 };
    }

    intersects(point) {
        let currentX = 0;
        for (const child of this.children) {
            const bounds = child.bounds();
            const childPoint = { x: point.x - currentX, y: point.y };
            if (child.intersects(childPoint)) {
                return true;
            }
            currentX += bounds.x1 - bounds.x0 + this.spacing;
        }
        return false;
    }
}

export class Column extends Glyph {
    constructor(spacing = 0) {
        super();
        this.spacing = spacing;
    }

    draw(window, offsetX = 0, offsetY = 0) {
        let currentY = 0;
        this.children.forEach(child => {
            child.draw(window, offsetX, offsetY + currentY);
            currentY += child.bounds().y1 - child.bounds().y0 + this.spacing;
        });
    }

    bounds() {
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        let currentY = 0;
        this.children.forEach(child => {
            const b = child.bounds();
            x0 = Math.min(x0, b.x0);
            y0 = Math.min(y0, currentY + b.y0);
            x1 = Math.max(x1, b.x1);
            y1 = Math.max(y1, currentY + b.y1);
            currentY += b.y1 - b.y0 + this.spacing;
        });
        return { x0: x0 === Infinity ? 0 : x0, y0: y0 === Infinity ? 0 : y0, x1: x1 === -Infinity ? 0 : x1, y1: y1 === -Infinity ? 0 : y1 };
    }

    intersects(point) {
        let currentY = 0;
        for (const child of this.children) {
            const bounds = child.bounds();
            const childPoint = { x: point.x, y: point.y - currentY };
            if (child.intersects(childPoint)) {
                return true;
            }
            currentY += bounds.y1 - bounds.y0 + this.spacing;
        }
        return false;
    }
}

export class Flow extends Glyph {
    constructor(maxWidth, spacing = 5) {
        super();
        this.maxWidth = maxWidth;
        this.spacing = spacing;
    }

    draw(window, offsetX = 0, offsetY = 0) {
        let currentX = 0;
        let currentY = 0;
        let lineHeight = 0;

        this.children.forEach(child => {
            const bounds = child.bounds();
            const width = bounds.x1 - bounds.x0;

            if (currentX + width > this.maxWidth && currentX > 0) {
                currentX = 0;
                currentY += lineHeight + this.spacing;
                lineHeight = 0;
            }

            child.draw(window, offsetX + currentX, offsetY + currentY);
            currentX += width + this.spacing;
            lineHeight = Math.max(lineHeight, bounds.y1 - bounds.y0);
        });
    }

    bounds() {
        let x0 = 0, y0 = 0, x1 = 0, y1 = 0;
        let currentX = 0;
        let currentY = 0;
        let lineHeight = 0;

        this.children.forEach(child => {
            const bounds = child.bounds();
            const width = bounds.x1 - bounds.x0;
            const height = bounds.y1 - bounds.y0;

            if (currentX + width > this.maxWidth && currentX > 0) {
                currentX = 0;
                currentY += lineHeight + this.spacing;
                lineHeight = 0;
            }

            x1 = Math.max(x1, currentX + width);
            y1 = Math.max(y1, currentY + height);
            lineHeight = Math.max(lineHeight, height);
            currentX += width + this.spacing;
        });

        return { x0, y0, x1, y1 };
    }

    intersects(point) {
        let currentX = 0;
        let currentY = 0;
        let lineHeight = 0;

        for (const child of this.children) {
            const bounds = child.bounds();
            const width = bounds.x1 - bounds.x0;
            const height = bounds.y1 - bounds.y0;
            const childPoint = { x: point.x - currentX, y: point.y - currentY };

            if (currentX + width > this.maxWidth && currentX > 0) {
                currentX = 0;
                currentY += lineHeight + this.spacing;
                lineHeight = 0;
            }

            if (child.intersects(childPoint)) {
                return true;
            }

            currentX += width + this.spacing;
            lineHeight = Math.max(lineHeight, height);
        }
        return false;
    }
}

// Special Glyphs ================================================
export class Space extends Glyph {
    constructor(width = 10, stretch = 5, shrink = 2, height = 0) {
        super();
        this.width = width;
        this.stretch = stretch;
        this.shrink = shrink;
        this.height = height;
    }

    draw(window, offsetX = 0, offsetY = 0) {
        // Space doesn't draw anything visible
    }

    bounds() {
        return { x0: 0, y0: 0, x1: this.width, y1: this.height };
    }

    intersects() {
        return false;
    }
}

export class Page extends Glyph {
  constructor(width, height, margin = 40) {
      super();
      this.width = width;
      this.height = height;
      this.margin = margin;
  }

  draw(window, offsetX = 0, offsetY = 0) {
      window.save();
      window.setStrokeStyle('gray');
      window.strokeRect(offsetX, offsetY, this.width, this.height);

      // Draw margin
      window.setStrokeStyle('lightgray');
      window.strokeRect(
          offsetX + this.margin,
          offsetY + this.margin,
          this.width - 2 * this.margin,
          this.height - 2 * this.margin
      );

      window.restore();

      // Draw children
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

/**
* @class Border
* @extends MonoGlyph
* @classdesc Decorator that adds a border around a glyph.
*/
export class Border extends MonoGlyph {
  constructor(component, options = {}) {
      super(component);
      this.color = options.color || 'black';
      this.thickness = options.thickness || 1;
      this.margin = options.margin || 5;
  }

  draw(window, offsetX = 0, offsetY = 0) {
      // First let the component draw itself
      super.draw(window, offsetX, offsetY);

      // Then draw the border
      const bounds = this.bounds();
      const x0 = bounds.x0 + offsetX - this.margin;
      const y0 = bounds.y0 + offsetY - this.margin;
      const width = bounds.x1 - bounds.x0 + 2 * this.margin;
      const height = bounds.y1 - bounds.y0 + 2 * this.margin;

      window.save();
      window.setStrokeStyle(this.color);
      window.setLineWidth(this.thickness);
      window.strokeRect(x0, y0, width, height);
      window.restore();
  }

  bounds() {
      const bounds = super.bounds();
      return {
          x0: bounds.x0 - this.margin,
          y0: bounds.y0 - this.margin,
          x1: bounds.x1 + this.margin,
          y1: bounds.y1 + this.margin
      };
  }

  intersects(point) {
      const bounds = this.bounds();
      return point.x >= bounds.x0 && point.x <= bounds.x1 &&
             point.y >= bounds.y0 && point.y <= bounds.y1;
  }
}

/**
* @class Scroller
* @extends MonoGlyph
* @classdesc Decorator that adds scrolling functionality to a glyph.
*/
export class Scroller extends MonoGlyph {
  constructor(component, options = {}) {
      super(component);
      this.scrollX = options.scrollX || 0;
      this.scrollY = options.scrollY || 0;
      this.viewportWidth = options.viewportWidth || 500;
      this.viewportHeight = options.viewportHeight || 500;
  }

  draw(window, offsetX = 0, offsetY = 0) {
      window.save();

      // Set clipping region to viewport
      const bounds = this.bounds();
      window.beginPath();
      window.rect(offsetX, offsetY, this.viewportWidth, this.viewportHeight);
      window.clip();

      // Translate according to scroll position
      super.draw(window, offsetX - this.scrollX, offsetY - this.scrollY);

      window.restore();

      // Draw scroll bars (simplified implementation)
      this.drawScrollBars(window, offsetX, offsetY);
  }

  drawScrollBars(window, offsetX, offsetY) {
      const contentBounds = this.component.bounds();
      const contentWidth = contentBounds.x1 - contentBounds.x0;
      const contentHeight = contentBounds.y1 - contentBounds.y0;

      const scrollBarThickness = 10;
      const scrollBarColor = 'rgba(200, 200, 200, 0.7)';
      const scrollThumbColor = 'rgba(100, 100, 100, 0.7)';

      if (contentWidth > this.viewportWidth) {
          // Draw horizontal scroll bar
          window.save();
          window.setFillStyle(scrollBarColor);
          window.fillRect(
              offsetX,
              offsetY + this.viewportHeight - scrollBarThickness,
              this.viewportWidth,
              scrollBarThickness
          );

          // Draw scroll thumb
          const thumbWidth = Math.max(
              30,
              (this.viewportWidth / contentWidth) * this.viewportWidth
          );
          const thumbPos = (this.scrollX / contentWidth) * this.viewportWidth;

          window.setFillStyle(scrollThumbColor);
          window.fillRect(
              offsetX + thumbPos,
              offsetY + this.viewportHeight - scrollBarThickness,
              thumbWidth,
              scrollBarThickness
          );
          window.restore();
      }

      if (contentHeight > this.viewportHeight) {
          // Draw vertical scroll bar
          window.save();
          window.setFillStyle(scrollBarColor);
          window.fillRect(
              offsetX + this.viewportWidth - scrollBarThickness,
              offsetY,
              scrollBarThickness,
              this.viewportHeight
          );

          // Draw scroll thumb
          const thumbHeight = Math.max(
              30,
              (this.viewportHeight / contentHeight) * this.viewportHeight
          );
          const thumbPos = (this.scrollY / contentHeight) * this.viewportHeight;

          window.setFillStyle(scrollThumbColor);
          window.fillRect(
              offsetX + this.viewportWidth - scrollBarThickness,
              offsetY + thumbPos,
              scrollBarThickness,
              thumbHeight
          );
          window.restore();
      }
  }

  bounds() {
      return {
          x0: 0,
          y0: 0,
          x1: this.viewportWidth,
          y1: this.viewportHeight
      };
  }

  intersects(point) {
      return point.x >= 0 && point.x <= this.viewportWidth &&
             point.y >= 0 && point.y <= this.viewportHeight;
  }

  scrollTo(x, y) {
      this.scrollX = x;
      this.scrollY = y;
  }

  scrollBy(dx, dy) {
      this.scrollX += dx;
      this.scrollY += dy;
  }

  handleWheel(deltaX, deltaY) {
    this.scrollBy(-deltaX, -deltaY); // 反转 delta 值以符合自然滚动方向
    // Clamp scroll values to content boundaries (optional)
    const contentBounds = this.component.bounds();
    this.scrollX = Math.max(0, Math.min(this.scrollX, contentBounds.x1 - contentBounds.x0 - this.viewportWidth));
    this.scrollY = Math.max(0, Math.min(this.scrollY, contentBounds.y1 - contentBounds.y0 - this.viewportHeight));
  }
}

/**
* @class MenuItem
* @classdesc Represents a menu item with a label and an associated command.
*/
export class MenuItem extends Glyph {
  constructor(label, command) {
      super();
      this.label = label;
      this.command = command;
      this.x = 0;
      this.y = 0;
      this.width = 150;
      this.height = 30;
      this.color = 'black';
      this.backgroundColor = '#f0f0f0';
      this.hoverBackgroundColor = '#ddd';
      this.isHovered = false;
  }

  draw(window, offsetX = 0, offsetY = 0) {
      window.save();
      window.setFillStyle(this.isHovered ? this.hoverBackgroundColor : this.backgroundColor);
      window.fillRect(offsetX + this.x, offsetY + this.y, this.width, this.height);
      window.setStrokeStyle('#999');
      window.strokeRect(offsetX + this.x, offsetY + this.y, this.width, this.height);
      window.setFillStyle(this.color);
      window.setFont('14px Arial');
      window.fillText(this.label, offsetX + this.x + 10, offsetY + this.y + 20);
      window.restore();
  }

  bounds() {
      return {
          x0: this.x,
          y0: this.y,
          x1: this.x + this.width,
          y1: this.y + this.height
      };
  }

  intersects(point) {
      return point.x >= this.x && point.x <= this.x + this.width &&
             point.y >= this.y && point.y <= this.y + this.height;
  }

  click() {
      if (this.command) {
          return this.command;
      }
      return null;
  }

  handleMouseEnter() {
      this.isHovered = true;
  }

  handleMouseLeave() {
      this.isHovered = false;
  }
}

// Cursor Glyph (之前提供的 Cursor 类的代码)
export class Cursor extends Glyph {
  constructor(x, y, height = 18, color = 'black') {
      super();
      this.x = x;
      this.y = y;
      this.height = height;
      this.color = color;
      this.width = 2;
      this.blinkInterval = 500; // ms
      this.visible = true;
      setInterval(() => {
          this.visible = !this.visible;
      }, this.blinkInterval);
  }

  draw(window, offsetX = 0, offsetY = 0) {
      if (this.visible) {
          window.save();
          window.setFillStyle(this.color);
          window.fillRect(this.x + offsetX, this.y + offsetY - this.height, this.width, this.height);
          window.restore();
      }
  }

  bounds() {
      return { x0: this.x, y0: this.y - this.height, x1: this.x + this.width, y1: this.y };
  }

  intersects(point) {
      const b = this.bounds();
      return point.x >= b.x0 && point.x <= b.x1 &&
             point.y >= b.y0 && point.y <= b.y1;
  }

  moveTo(x, y) {
      this.x = x;
      this.y = y;
  }

  moveBy(dx, dy) {
      this.x += dx;
      this.y += dy;
  }
}