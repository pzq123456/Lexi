# Class: Glyphs

We'll define a Glyph abstract class for all objects that can appear in a document structure. Its subclasses define both primitive graphical elements (like characters and images) and structural elements (like rows and columns). Figure 2.4 depicts a representative part of the Glyph class hierarchy, and Table 2.1 presents the basic glyph interface in more detail using C++ notation.

Glyphs have three basic responsibilities:
1. They know how to draw themselves.
2. They know what space they occupy.
3. They know their children and parent.

## Glyph Subclasses and Operations

### Drawing Glyphs
Glyph subclasses redefine the `Draw` operation to render themselves onto a window. They are passed a reference to a `Window` object in the call to `Draw`. The `Window` class defines graphics operations for rendering text and basic shapes in a window on the screen. For example, a `Rectangle` subclass of `Glyph` might redefine `Draw` as follows:

```cpp
void Rectangle::Draw(Window* w) {
    w->DrawRect(_x0, _y0, _x1, _y1);
}
```

Here, `_x0`, `_y0`, `_x1`, and `_y1` are data members of `Rectangle` that define two opposing corners of the rectangle. `DrawRect` is the `Window` operation that makes the rectangle appear on the screen.

### Bounds and Intersection
A parent glyph often needs to know how much space a child glyph occupies, for example, to arrange it and other glyphs in a line so that none overlaps. The `Bounds` operation returns the rectangular area that the glyph occupies. It returns the opposite corners of the smallest rectangle that contains the glyph. Glyph subclasses redefine this operation to return the rectangular area in which they draw.

The `Intersects` operation determines whether a specified point intersects the glyph. Whenever the user clicks somewhere in the document, Lexi calls this operation to determine which glyph or glyph structure is under the mouse. The `Rectangle` class redefines this operation to compute the intersection of the rectangle and the given point.

### Managing Children
Because glyphs can have children, we need a common interface to add, remove, and access those children. For example, a `Row`'s children are the glyphs it arranges into a row. The following operations are used for managing children:

- **`Insert`**: Inserts a glyph at a position specified by an integer index.
- **`Remove`**: Removes a specified glyph if it is indeed a child.
- **`Child`**: Returns the child (if any) at the given index.

Glyphs like `Row` that can have children should use `Child` internally instead of accessing the child data structure directly. This ensures that operations like `Draw`, which iterate through the children, remain unaffected when the data structure changes (e.g., from an array to a linked list).

### Parent Interface
The `Parent` operation provides a standard interface to the glyph's parent, if any. Glyphs in Lexi store a reference to their parent, and their `Parent` operation simply returns this reference.

### Composite Pattern
Recursive composition is useful for representing any potentially complex, hierarchical structure. The **Composite** pattern captures the essence of recursive composition in object-oriented terms. This pattern is particularly relevant for scenarios like the one described here, where glyphs form a hierarchical document structure.
