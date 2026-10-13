import { Maze } from './maze-generator.js';
export { searchMazes };
// Enumerate every maze of the given size in one pass, keeping one
// representative (the canonical maze) of each set of mazes related by
// rotation and reflection.
function searchMazes(rows, cols, onProgress, progressInterval = 5000) {
    const maze = new Maze(rows, cols);
    const wallCount = maze.walls.length;
    const walls = [];
    const symmetries = [];
    let total = 0;
    const symCounts = { "1": 0, "2": 0, "4": 0, "8": 0 };
    for (let m of maze.allMazes(true)) {
        total++;
        if (onProgress && total % progressInterval === 0) {
            onProgress(total);
        }
        if (!m.isCanonical) {
            continue;
        }
        symCounts[m.symmetry]++;
        symmetries.push(m.symmetry);
        // allMazes() reuses one Maze object, so copy its walls now.
        for (let w of m.walls) {
            walls.push(w ? 1 : 0);
        }
    }
    return {
        rows, cols, wallCount, total,
        unique: symmetries.length,
        symCounts,
        walls: Uint8Array.from(walls),
        symmetries: Uint8Array.from(symmetries),
    };
}
//# sourceMappingURL=maze-search.js.map