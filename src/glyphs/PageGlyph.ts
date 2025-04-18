// import { Glyph, Point, Bounds } from '../core/Glyph';
// import { IWindow } from '../core/IWindow';
// import { ColumnGlyph } from './ColumnGlyph';

// // Page 默认占据整个窗口
// export class PageGlyph extends Glyph{
//     private compositor: ;
//     private pageWidth: number;
//     private pageHeight: number;
//     private columnGap: number;

//     constructor(pageWidth = 800, pageWidth = 800, columnGap = 20) {
//         super();
//         this.pageWidth = pageWidth;
//         this.columnGap = columnGap;
//     }


//     compose() {
//         this.compositor.SetComposition(this.compositor);
//         this.compositor.Compose();
//     }


//     getBounds(): Bounds {
//         if (this.children.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

//         const first = this.children[0].getBounds();
//         const last = this.children[this.children.length - 1].getBounds();

//         const x = this.position.x;
//         const y = this.position.y;

//         const totalWidth = last.x + last.width - x;
//         const totalHeight = Math.max(...this.children.map(col => col.getBounds().y + col.getBounds().height)) - y;

//         return {
//             x, y,
//             width: totalWidth,
//             height: totalHeight,
//         };
//     }

//     draw(window: IWindow): void {
//         for (const column of this.children as ColumnGlyph[]) {
//             column.draw(window);
//         }

//         // Draw page border
//         window.drawRect(this.getBounds(), {
//             fillColor: 'rgba(0, 0, 255, 0.05)',
//             strokeColor: 'blue',
//             lineWidth: 1
//         });
//     }
// }
