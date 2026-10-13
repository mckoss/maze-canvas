import { Maze, MazeCount } from './maze-generator.js';

export { searchMazes, MazeSearchResult };

type MazeSearchResult = MazeCount & {
    rows: number;
    cols: number;

    // Number of internal walls in each maze.
    wallCount: number;

    // The walls of each unique (canonical) maze, wallCount entries per maze
    // (1 = wall present).
    walls: Uint8Array;

    // The symmetry of each unique maze.
    symmetries: Uint8Array;
}

// Enumerate every maze of the given size in one pass, keeping one
// representative (the canonical maze) of each set of mazes related by
// rotation and reflection.
function searchMazes(rows: number, cols: number,
    onProgress?: (found: number) => void, progressInterval = 5000): MazeSearchResult {
    const maze = new Maze(rows, cols);
    const wallCount = maze.walls.length;
    const walls: number[] = [];
    const symmetries: number[] = [];

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
