export { tuples, Maze, Direction, oppositeDir };

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
    readonly completeWalls: number;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.completeWalls = rows * cols - rows - cols + 1;
        this.cells = new Array(rows * cols).fill(0);
        this.walls = new Array(rows * (cols - 1) + cols * (rows - 1)).fill(false);
    }

    *allMazes(): Generator<Maze> {
        yield *this.allMazesFromRow(0);
    }

    get numWalls() : number {
        return this.walls.reduce((acc, cur) => acc + (cur ? 1 : 0), 0);
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
                // All connected mazes with the correct number of walls contain
                // no loops.
                console.log(this.allHaveExit(row), this.numWalls);
                if (this.allHaveExit(row) && this.numWalls === this.completeWalls) {
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

    setWall(row: number, col: number, dir: Direction, value = true) {
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
            if (row < 0) {
                return -1;
            }
            dir = Direction.down;
        } else if (dir === Direction.left) {
            col--;
            if (col < 0) {
                return -1;
            }
            dir = Direction.right;
        }

        if (row === this.rows - 1 && dir === Direction.down) {
            return -1;
        }

        if (col === this.cols - 1 && dir === Direction.right) {
            return -1;
        }

        let index = row * (2 * this.cols - 1) + col;

        if (dir === Direction.down) {
            index += this.cols - 1;
        }

        return index;
    }

    allHaveExit(lastRow: number): boolean {
        let exitableCount = 0;
        let allCount = this.cellIndex(lastRow + 1, 0);
        let distances = new Array(allCount).fill(-1);
        // row, col
        let stack: [number, number][] = [];

        for (let col = 0; col < this.cols; col++) {
            if (lastRow === this.rows - 1 ||
                !this.hasWall(lastRow, col, Direction.down)) {
                distances[this.cellIndex(lastRow, col)] = 0;
                exitableCount++;
                stack.push([lastRow, col]);
            }
        }

        while (stack.length > 0) {
            const [row, col] = stack.pop()!;
            const icell = this.cellIndex(row, col);
            const dist = distances[icell];
            for (let dir = 0; dir < 4; dir++) {
                if (this.hasWall(row, col, dir) || row + dcell[dir][0] > lastRow) {
                    continue;
                }

                const icellNext = this.neighborIndex(row, col, dir);
                if (icellNext === -1 || distances[icellNext] !== -1) {
                    continue;
                }

                distances[icellNext] = dist + 1;
                exitableCount++;
                stack.push([row + dcell[dir][0], col + dcell[dir][1]]);
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
