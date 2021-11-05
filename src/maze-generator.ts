export { tuples, Maze, Direction, TESTING };

// Exposed for testing - not part of the public API.
const TESTING = { compose, oppositeDir, rotateDir, reflectDir };

enum Direction {
    up = 0, right = 1, down = 2, left = 3
}

function oppositeDir(dir: Direction): Direction {
    return (dir + 2) % 4;
}

// Rotate clockwise 90 degrees.
function rotateDir(dir: Direction): Direction {
    return (dir + 1) % 4;
}

// Reflection across vertical axis.
function reflectDir(dir: Direction): Direction {
    return [Direction.up, Direction.left, Direction.down, Direction.right][dir];
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

    // The 7 transforms of wall indices rotating and
    // horizontal reflection.
    // r1, r2, r3, h, h.r1, h.r2, h.r3
    transforms: number[][] = [];

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

        if (this.rows === this.cols) {
            let r1: number[] = [];
            let horiz: number[] = [];
            let index = 0;
            for (let coords of this.allWallCoords()) {
                r1.push(this.wallIndex(...this.rot(...coords)));
                horiz.push(this.wallIndex(...this.reflect(...coords)));
            }
            const r2 = compose(r1, r1);
            const r3 = compose(r2, r1);
            this.transforms.push(r1, r2, r3);
            this.transforms.push(horiz);
            for (let i = 0; i < 3; i++) {
                this.transforms.push(compose(horiz, this.transforms[i]));
            }
        }
    }

    rot(row: number, col:number, dir: Direction): [number, number, Direction] {
        if (this.rows !== this.cols) {
            throw new Error('Cannot rotate non-square maze');
        }
        return [col, this.rows - row - 1, rotateDir(dir)];
    }

    reflect(row: number, col: number, dir:Direction): [number, number, Direction] {
        return [row, this.cols - col - 1, reflectDir(dir)];
    }

    countMazes(): number {
        let count = 0;
        for (let m of this.allMazes()) {
            count++;
        }
        return count;
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
                    if (!this.allHaveExit(row)) {
                        continue;
                    }
                    yield *this.allMazesFromRow(row + 1);
                }
            } else {
                if (this.uniquelyConnected()) {
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

        // Index for right wall.
        let index = row * (2 * this.cols - 1) + col;

        // Adjustment for down wall.
        if (dir === Direction.down) {
            index += this.cols - 1;
        }

        return index;
    }

    // Generate wall coordinates in index order.
    *allWallCoords(): Generator<[number, number, Direction]> {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols - 1; col++) {
                yield [row, col, Direction.right];
            }
            if (row === this.rows - 1) {
                break;
            }
            for (let col = 0; col < this.cols; col++) {
                yield [row, col, Direction.down];
            }
        }
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

    uniquelyConnected(): boolean {
        const visited = new Array(this.cells.length).fill(false);
        let count = 0;
        const stack: [number, number, Direction][] = [];

        // Pretend we're starting from above the maze.
        stack.push([0, 0, Direction.up]);
        visited[0] = true;
        count++;

        while (stack.length > 0) {
            const [row, col, fromDir] = stack.pop()!;
            const index = this.cellIndex(row, col);
            for (let dir = 0; dir < 4; dir++) {
                if (fromDir === dir || this.hasWall(row, col, dir)) {
                    continue;
                }
                const indexNeighbor = this.neighborIndex(row, col, dir);
                if (indexNeighbor !== -1) {
                    if (visited[indexNeighbor]) {
                        return false;
                    }
                    stack.push([row + dcell[dir][0], col + dcell[dir][1],
                        oppositeDir(dir)]);
                    visited[indexNeighbor] = true;
                    count++;
                }
            }
        }

        return count === this.cells.length;
    }

    toString(): string {
        let result = '';
        result += '.' + '_.'.repeat(this.cols) + '\n';

        for (let row = 0; row < this.rows; row++) {
            result += '|';
            for (let col = 0; col < this.cols; col++) {
                if (this.hasWall(row, col, Direction.right)) {
                    result += ' |';
                } else {
                    result += '  ';
                }
            }
            result += '\n.';
            for (let col = 0; col < this.cols; col++) {
                if (this.hasWall(row, col, Direction.down)) {
                    result += '_.';
                } else {
                    result += ' .';
                }
            }
            result += '\n';
        }
        return result;
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

// Compose two mapping arrays to form a new mapping array.
// The indices of the sccond array are applied first to yield
// indices into the first array (e.g. compose a with b).
// c[x] = a[b[x]]
function compose(a: number[], b: number[]): number[] {
    let c = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        c[i] = a[b[i]];
    }
    return c;
}
