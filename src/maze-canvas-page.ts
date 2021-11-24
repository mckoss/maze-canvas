import { Maze } from './maze-generator.js';
import { MazeCanvas } from './maze-canvas.js';

export { initializePage };

type ElementBindings = { [key: string]: HTMLElement };

const elements = bindElements('maze-canvas', 'error', 'rows', 'columns',
'generate', 'maze-size', 'total', 'unique');

const params = {
    margin: 20,
    spacing: 15,
};

function initializePage() {
    const mazeCanvas = elements['maze-canvas'] as HTMLCanvasElement;
    const ctx = mazeCanvas.getContext('2d')!;

    const width = mazeCanvas.width;
    const height = mazeCanvas.height;
    ctx.fillStyle = 'rgb(177, 31, 31)';
    ctx.fillRect(0, 0, width, height);

    drawMazes(3, 3, ctx);
}

function drawMazes(rows: number, columns: number, ctx: CanvasRenderingContext2D) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const maze = new Maze(rows, columns);
    const { total, unique, symCounts } = maze.countMazes();

    elements['maze-size'].textContent = `${rows} × ${columns}`;
    elements.total.textContent = total.toString();
    elements.unique.textContent = unique.toString();

    const mazesPerRow = Math.ceil(Math.sqrt(unique));
    const spacePerRow = 2 * params.margin + (mazesPerRow - 1) * params.spacing;

    let mc = new MazeCanvas(rows, columns, []);
    mc.sizeFromWidth((width - spacePerRow) / mazesPerRow);

    const stepDim = [mc.mazeSize[0] + params.spacing, mc.mazeSize[1] + params.spacing];

    let pos: [number, number] = [params.margin, params.margin];
    let col = 0;

    for (let m of maze.allMazes(true)) {
        if (!m.isCanonical) {
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
        } else {
            pos[0] += stepDim[0];
        }
    }


}

function bindElements(...eltNames: string[]): ElementBindings {
    let results: { [key: string]: HTMLElement } = {};
    for (let eltName of eltNames) {
        results[eltName] = document.getElementById(eltName)!;
    }
    return results;
}
