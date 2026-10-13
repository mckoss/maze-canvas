import { MazeCanvas } from './maze-canvas.js';
import { layoutGrid } from './maze-layout.js';
import { pluralize } from './util.js';
export { initializePage };
const elements = bindElements('maze-list', 'error', 'rows', 'columns', 'show', 'stats');
// The list is drawn as a stack of canvas tiles no taller than this
// (a single canvas for thousands of mazes would exceed browser limits).
// Only tiles near the viewport hold a drawing.
const MAX_TILE_HEIGHT = 2000;
const displayTypes = {
    "1": "unique",
    "2": "symmetric",
    "4": "4-way symmetric",
};
// Search results by size ("rows x cols").
const results = new Map();
let worker;
// Size the worker is searching.
let searchKey = '';
let observer;
let renderedWidth = 0;
function initializePage() {
    for (let id of ['rows', 'columns', 'show']) {
        elements[id].addEventListener('change', update);
    }
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
            if (contentWidth() !== renderedWidth) {
                update();
            }
        }, 200);
    });
    update();
}
function selected(id) {
    return parseInt(elements[id].value, 10);
}
function update() {
    const rows = selected('rows');
    const cols = selected('columns');
    const key = `${rows}x${cols}`;
    const result = results.get(key);
    if (result) {
        render(result, selected('show'));
        return;
    }
    search(rows, cols, key);
}
function search(rows, cols, key) {
    // The running search will show the current options when it's done.
    if (worker && key === searchKey) {
        return;
    }
    worker?.terminate();
    searchKey = key;
    clearList();
    setOptionCounts();
    elements.stats.textContent = `Searching ${rows} × ${cols} mazes…`;
    const w = new Worker(new URL('./maze-worker.js', import.meta.url), { type: 'module' });
    worker = w;
    w.onmessage = (e) => {
        if (e.data.type === 'progress') {
            elements.stats.textContent =
                `Searching ${rows} × ${cols} mazes… ${e.data.found.toLocaleString()} found`;
            return;
        }
        w.terminate();
        worker = undefined;
        results.set(key, e.data.result);
        update();
    };
    w.onerror = (e) => {
        worker = undefined;
        showError(`Maze search failed: ${e.message}`);
    };
    w.postMessage({ rows, cols });
}
function render(result, showSym) {
    const { rows, cols, wallCount } = result;
    // Indices of the unique mazes to display.
    const shown = [];
    result.symmetries.forEach((sym, i) => {
        if (sym >= showSym) {
            shown.push(i);
        }
    });
    elements.stats.textContent =
        `There are ${result.total.toLocaleString()} mazes of size ${rows} × ${cols} ` +
            `(${result.unique.toLocaleString()} unique). ` +
            `Displaying ${pluralize(shown.length, displayTypes[showSym] + ' maze')}.`;
    setOptionCounts(result);
    clearList();
    const list = elements['maze-list'];
    list.hidden = false;
    const width = contentWidth();
    renderedWidth = width;
    list.hidden = shown.length === 0;
    const mc = new MazeCanvas(rows, cols, []);
    const layout = layoutGrid(shown.length, rows, cols, width, mc);
    const rowsPerTile = Math.max(1, Math.floor(MAX_TILE_HEIGHT / layout.step[1]));
    const tiles = new Map();
    observer = new IntersectionObserver((entries) => {
        for (let entry of entries) {
            const canvas = entry.target;
            if (entry.isIntersecting) {
                tiles.get(canvas)();
            }
            else {
                // Release the drawing; the CSS size keeps its place in the list.
                canvas.width = 0;
                canvas.height = 0;
            }
        }
    }, { rootMargin: '1500px 0px' });
    for (let firstRow = 0; firstRow < layout.numRows; firstRow += rowsPerTile) {
        const lastRow = Math.min(firstRow + rowsPerTile, layout.numRows);
        const height = lastRow === layout.numRows ?
            layout.height - firstRow * layout.step[1] :
            (lastRow - firstRow) * layout.step[1];
        const canvas = document.createElement('canvas');
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.width = 0;
        canvas.height = 0;
        list.appendChild(canvas);
        tiles.set(canvas, () => drawTile(canvas, width, height, firstRow, lastRow, layout, mc, (i) => {
            const start = shown[i] * wallCount;
            return result.walls.subarray(start, start + wallCount);
        }, shown.length));
        observer.observe(canvas);
    }
}
function drawTile(canvas, width, height, firstRow, lastRow, layout, mc, wallsOf, count) {
    if (canvas.width !== 0) {
        return;
    }
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    for (let row = firstRow; row < lastRow; row++) {
        for (let col = 0; col < layout.perRow; col++) {
            const i = row * layout.perRow + col;
            if (i >= count) {
                return;
            }
            mc.setWalls(wallsOf(i));
            ctx.save();
            ctx.translate(layout.offsetX + col * layout.step[0], (row - firstRow) * layout.step[1]);
            mc.drawMaze(ctx);
            ctx.restore();
        }
    }
}
function clearList() {
    observer?.disconnect();
    observer = undefined;
    elements['maze-list'].replaceChildren();
    elements['maze-list'].hidden = true;
    elements.error.style.visibility = 'hidden';
}
// Show the number of unique mazes of each kind in the Show menu.
function setOptionCounts(result) {
    for (let option of elements.show.options) {
        const label = option.dataset.label ?? option.text;
        option.dataset.label = label;
        if (result === undefined) {
            option.text = label;
            continue;
        }
        const minSym = parseInt(option.value, 10);
        const count = result.symmetries.filter(sym => sym >= minSym).length;
        option.text = `${label} (${count.toLocaleString()})`;
    }
}
// Width available for drawing inside the list's padding.
function contentWidth() {
    const list = elements['maze-list'];
    const style = getComputedStyle(list);
    return Math.floor(list.clientWidth -
        parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
}
function showError(message) {
    elements.error.textContent = message;
    elements.error.style.visibility = 'visible';
}
function bindElements(...eltNames) {
    let results = {};
    for (let eltName of eltNames) {
        results[eltName] = document.getElementById(eltName);
    }
    return results;
}
//# sourceMappingURL=maze-canvas-page.js.map