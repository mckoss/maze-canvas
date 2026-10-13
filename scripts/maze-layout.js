import { MazeCanvas } from './maze-canvas.js';
export { layoutGrid };
const SPACING = 6;
// Lay out count mazes of rows x cols cells in a grid that is width pixels
// wide. Small sets are drawn as a squarish block; large ones wrap into a
// long list of mazes no smaller than minimum size.
function layoutGrid(count, rows, cols, width, mc = new MazeCanvas(rows, cols, [])) {
    const cells = Math.max(rows, cols);
    const minBox = 12 * cells;
    const maxBox = 60 * cells;
    const fit = Math.max(1, Math.floor((width + SPACING) / (minBox + SPACING)));
    const perRow = Math.max(1, Math.min(Math.ceil(Math.sqrt(count)), fit));
    const box = Math.min(maxBox, Math.floor((width - (perRow - 1) * SPACING) / perRow));
    mc.scaleToFit(box, box);
    const mazeSize = [mc.mazeSize[0], mc.mazeSize[1]];
    const step = [mazeSize[0] + SPACING, mazeSize[1] + SPACING];
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
//# sourceMappingURL=maze-layout.js.map