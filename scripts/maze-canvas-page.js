import { Maze } from './maze-generator.js';
import { MazeCanvas } from './maze-canvas.js';
export { initializePage };
const elements = bindElements('maze-canvas', 'error', 'rows', 'columns', 'generate', 'maze-size', 'total', 'unique', 'display-type', 'displayed');
const params = {
    margin: 20,
    spacing: 8,
    backgroundColor: 'rgb(177, 31, 31)',
};
const displayTypes = {
    "1": "unique",
    "2": "2-symmetric",
    "4": "4-symmetric",
};
function initializePage() {
    const mazeCanvas = elements['maze-canvas'];
    const ctx = mazeCanvas.getContext('2d');
    const width = mazeCanvas.width;
    const height = mazeCanvas.height;
    ctx.fillStyle = params.backgroundColor;
    ctx.fillRect(0, 0, width, height);
    drawMazes(3, 3, 1, ctx);
}
function drawMazes(rows, columns, showSym, ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const maze = new Maze(rows, columns);
    const { total, unique, symCounts } = maze.countMazes();
    elements['maze-size'].textContent = `${rows} × ${columns}`;
    elements.total.textContent = total.toLocaleString();
    elements.unique.textContent = unique.toLocaleString();
    let displayed = 0;
    for (let [sym, count] of Object.entries(symCounts)) {
        if (showSym <= parseInt(sym, 10)) {
            displayed += count;
        }
    }
    elements['display-type'].textContent = displayTypes[showSym.toString()];
    elements.displayed.textContent = displayed.toLocaleString();
    const mazesPerRow = Math.ceil(Math.sqrt(displayed));
    const spacePerRow = 2 * params.margin + (mazesPerRow - 1) * params.spacing;
    let mc = new MazeCanvas(rows, columns, []);
    mc.sizeFromWidth(Math.floor((width - spacePerRow) / mazesPerRow));
    const stepDim = [mc.mazeSize[0] + params.spacing, mc.mazeSize[1] + params.spacing];
    let pos = [params.margin, params.margin];
    let col = 0;
    for (let m of maze.allMazes(true)) {
        if (!m.isCanonical) {
            continue;
        }
        if (m.symmetry < showSym) {
            continue;
        }
        mc.setWalls(m.walls);
        ctx.save();
        ctx.translate(pos[0], pos[1]);
        mc.drawMaze(ctx);
        ctx.restore();
        col += 1;
        if (col >= mazesPerRow) {
            pos[0] = params.margin;
            pos[1] += stepDim[1];
            col = 0;
        }
        else {
            pos[0] += stepDim[0];
        }
    }
}
function bindElements(...eltNames) {
    let results = {};
    for (let eltName of eltNames) {
        results[eltName] = document.getElementById(eltName);
    }
    return results;
}
//# sourceMappingURL=maze-canvas-page.js.map