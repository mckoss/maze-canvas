export { tuples, Maze, Direction };

enum Direction {
    up = 0, right = 1, down = 2, left = 3
}

function oppositeDir(dir: Direction): Direction {
    return (dir + 2) % 4;
}

// Differential index in row cells and column cells.
const dcell: [number, number][] = [
    [-1, 0], [0, 1], [1, 0], [0, -1]
];

class MazeCount {
    sym1: number;
    sym2: number;
    sym4: number;
    sym8: number;

    constructor() {
        this.sym1 = 0;
        this.sym2 = 0;
        this.sym4 = 0;
        this.sym8 = 0;
    }
}

class Maze {
    rows: number;
    cols: number;

    // 1, 2, 4, or 8
    symmetries: number = 1;

    // Cells contains a partition index.
    cells: number[];

    // Walls are in row-major order beginning with
    // vertical walls in the first row, and alternating
    // between the vertical and horizontal walls of the maze.
    walls: boolean[];

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.cells = new Array(rows * cols).fill(0);
        this.walls = new Array(rows * (cols - 1) + cols * (rows - 1)).fill(false);
    }

    *allMazes(): Generator<Maze> {
        yield *this.allMazesFromRow(0);
    }

    *allMazesFromRow(row: number): Generator<Maze> {
        for (let verticals of this.forAllVerticalWalls()) {
            copyTo(this.walls, this.wallIndex(row, 0, Direction.right),
                verticals);
            if (row < this.rows - 1) {
                for (let horizontals of this.forAllHorizontalWalls()) {
                    copyTo(this.walls, this.wallIndex(row, 0, Direction.down),
                        horizontals);
                    yield *this.allMazesFromRow(row + 1);
                }
            } else {
                if (this.allHaveSingleExit(row)) {
                    yield this;
                }
            }
        }
    }

    *forAllVerticalWalls(): Generator<boolean[]> {
        for (let t of tuples(2, this.cols - 1)) {
            yield t.map(x => x !== 0);
        }
    }

    *forAllHorizontalWalls(): Generator<boolean[]> {
        for (let t of tuples(2, this.cols)) {
            yield t.map(x => x !== 0);
        }
    }

    cellIndex(row: number, col: number): number {
        return row * this.cols + col;
    }

    neighborIndex(row: number, col: number, dir: Direction): number {
        row += dcell[dir][0];
        col += dcell[dir][1];
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return -1;
        }
        return this.cellIndex(row, col);
    }

    setWall(row: number, col: number, dir: Direction, value: boolean) {
        const index = this.wallIndex(row, col, dir);
        if (index === -1) {
            return;
        }
        this.walls[index] = value;
    }

    hasWall(row: number, col: number, dir: Direction): boolean {
        const index = this.wallIndex(row, col, dir);
        if (index === -1) {
            return true;
        }
        return this.walls[index];
    }

    wallIndex(row: number, col:  number, dir: Direction): number {
        // Each row has cols - 1 vertical walls and cols horizontal walls.
        if (dir === Direction.up) {
            row--;
            dir = Direction.down;
        } else if (dir === Direction.left) {
            col--;
            dir = Direction.right;
        }

        if (row < 0 || col < 0 || row > this.rows - 1 || col > this.cols - 1) {
            return -1;
        }

        let result = row * (2 * this.cols - 1) + col;

        if (dir === Direction.down) {
            result += this.cols - 1;
        }

        return result;
    }

    allHaveSingleExit(lastRow: number): boolean {
        let exitableCount = 0;
        let allCount = this.cellIndex(lastRow + 1, 0);
        let distances = new Array(allCount).fill(-1);
        // row, col, and fromDir
        let stack: [number, number, number][] = [];

        for (let col = 0; col < this.cols; col++) {
            if (!this.hasWall(lastRow, col, Direction.down)) {
                distances[this.cellIndex(lastRow, col)] = 0;
                exitableCount++;
                stack.push([lastRow, col, Direction.down]);
            }
        }

        while (stack.length > 0) {
            const [row, col, fromDir] = stack.pop()!;
            const icell = this.cellIndex(row, col);
            const dist = distances[icell];
            for (let dir = 0; dir < 4; dir++) {
                if (dir === fromDir) {
                    continue;
                }

                const icellNext = this.neighborIndex(row, col, dir);
                if (icellNext === -1) {
                    continue;
                }

                const distNext = distances[icellNext];

                // Found a multi-path exit.
                if (distNext !== -1) {
                    return false;
                }

                distances[icellNext] = dist + 1;
                exitableCount++;
                stack.push([row, col, oppositeDir(dir)]);
            }
        }

        return exitableCount === allCount;
    }
}

function *tuples(maxValue: number, values: number): Generator<number[]> {
    if (values === 0) {
        yield [];
        return;
    }

    for (let t of tuples(maxValue, values - 1)) {
        t.push(0);
        for (let i = 0; i < maxValue; i++) {
            t[t.length - 1] = i;
            yield t;
        }
        t.pop();
    }
}

function copyTo(dest: any[], iDest: number, src: any[]): void {
    for (let i = 0; i < src.length; i++) {
        dest[iDest + i] = src[i];
    }
}
