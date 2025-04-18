import { CanvasWindow } from './window/CanvasWindow';
import { TeXCompositor } from './compositors/TeXCompositor';
import { chars } from './text';

const container = document.getElementById('container') as HTMLDivElement;

const pageWidth = 793;
const pageHeight = 1122;
const pageGap = 20;
const renderBuffer = 1; // 上下缓冲页数
const maxCanvasPoolSize = 10;

const canvasMap = new Map<number, { canvas: HTMLCanvasElement, window: CanvasWindow }>();
const canvasPool: HTMLCanvasElement[] = [];

function createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.position = 'absolute';
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    return canvas;
}

function getReusableCanvas(): HTMLCanvasElement {
    return canvasPool.pop() || createCanvas(pageWidth, pageHeight);
}

function releaseCanvas(index: number) {
    const entry = canvasMap.get(index);
    if (entry) {
        container.removeChild(entry.canvas);
        canvasMap.delete(index);
        if (canvasPool.length < maxCanvasPoolSize) {
            canvasPool.push(entry.canvas);
        }
    }
}

function setupCanvasWindow(canvas: HTMLCanvasElement): CanvasWindow {
    container.appendChild(canvas);
    return new CanvasWindow(canvas);
}

function composePages(compositor: TeXCompositor): void {
    const columns = compositor.Compose();
    const totalPages = columns.length;

    container.style.position = 'relative';
    container.style.height = `${totalPages * (pageHeight + pageGap)}px`;

    const observers: IntersectionObserver[] = [];
    const sentinelList: HTMLDivElement[] = [];

    function observePage(index: number) {
        const sentinel = document.createElement('div');
        sentinel.style.position = 'absolute';
        sentinel.style.top = `${index * (pageHeight + pageGap)}px`;
        sentinel.style.height = `${pageHeight}px`;
        sentinel.style.width = `100%`;
        sentinel.dataset.index = index.toString();
        container.appendChild(sentinel);
        sentinelList.push(sentinel);

        const observer = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    const idx = parseInt(entry.target.getAttribute('data-index') || '0');
                    if (entry.isIntersecting) {
                        if (!canvasMap.has(idx)) {
                            const canvas = getReusableCanvas();
                            canvas.style.top = `${idx * (pageHeight + pageGap)}px`;
                            const win = setupCanvasWindow(canvas);
                            columns[idx].setPosition({ x: 146, y: 75 });
                            columns[idx].layout(win);
                            columns[idx].draw(win);

                            // canvas 四角绘制提示线
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                                ctx.strokeStyle = 'gray';
                                ctx.lineWidth = 2;
                                ctx.strokeRect(0, 0, cornerX, cornerY);
                                // 右上角
                                ctx.strokeRect(canvas.width - cornerX, 0, cornerX, cornerY);
                                // 左下角
                                ctx.strokeRect(0, canvas.height - cornerY, cornerX, cornerY);
                                // 右下角
                                ctx.strokeRect(canvas.width - cornerX, canvas.height - cornerY, cornerX, cornerY);
                                // 右下角绘制页数
                                ctx.fillStyle = 'gray';
                                ctx.font = '20px Arial';
                                ctx.fillText(`Page ${idx + 1}`, canvas.width - cornerX + 10, canvas.height - cornerY + 20);
                            }
                            container.appendChild(canvas);

                            canvasMap.set(idx, { canvas, window: win });
                        }
                    } else {
                        releaseCanvas(idx);
                    }
                }
            },
            {
                root: container,
                rootMargin: `${renderBuffer * (pageHeight + pageGap)}px 0px`,
                threshold: 0.01
            }
        );

        observer.observe(sentinel);
        observers.push(observer);
    }

    for (let i = 0; i < totalPages; i++) {
        observePage(i);
    }
}

// 初始化
const initialCanvas = createCanvas(pageWidth, pageHeight);
initialCanvas.style.top = `0px`;
const initialWindow = setupCanvasWindow(initialCanvas);

const columnWidth = 600;
const columnHeight = 1000;

const cornerX = (pageWidth - columnWidth) / 2;
const cornerY = (pageHeight - columnHeight) / 2;


const texCompositor = new TeXCompositor(chars, initialWindow, columnWidth, columnHeight, 10);
composePages(texCompositor);
