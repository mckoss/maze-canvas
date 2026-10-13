import { MazeCanvas } from './maze-canvas.js';

export { layoutGrid, GridLayout };

type GridLayout = {
    perRow: number;
    numRows: number;
    // Size of each drawn maze.
    mazeSize: [number, number];
    // Distance from one maze to the next, across and down.
    step: [number, number];
    // Left offset that centers the grid in the available width.
    offsetX: number;
    // Total height of the grid.
    height: number;
};

const SPACING = 6;

// Lay out count mazes of rows x cols cells in a grid that is width pixels
// wide. Small sets are drawn as a squarish block; large ones wrap into a
// long list of mazes no smaller than minimum size.
function layoutGrid(count: number, rows: number, cols: number, width: number,
    mc = new MazeCanvas(rows, cols, [])): GridLayout {
    const cells = Math.max(rows, cols);
    const minBox = 12 * cells;
    const maxBox = 60 * cells;

    const fit = Math.max(1, Math.floor((width + SPACING) / (minBox + SPACING)));
    const perRow = Math.max(1, Math.min(Math.ceil(Math.sqrt(count)), fit));
    const box = Math.min(maxBox,
        Math.floor((width - (perRow - 1) * SPACING) / perRow));

    mc.scaleToFit(box, box);
    const mazeSize: [number, number] = [mc.mazeSize[0], mc.mazeSize[1]];
    const step: [number, number] = [mazeSize[0] + SPACING, mazeSize[1] + SPACING];

    const numRows = Math.ceil(count / perRow);
    const gridWidth = perRow * step[0] - SPACING;

    return {
        perRow,
        numRows,
        mazeSize,
        step,
        offsetX: Math.max(0, Math.floor((width - gridWidth) / 2)),
        height: Math.max(0, numRows * step[1] - SPACING),
    };
}
