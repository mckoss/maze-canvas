export { tuples, Maze, Direction };

enum Direction {
    up, right, down, left
}

// Differential in column cells and row cells.
const dcell: [number, number][] = [
    [0, -1], [1, 0], [0, 1], [-1, 0]
];

class Maze {
    rows: number;
    cols: number;

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
            //here
            console.log(verticals);
            if (row < this.rows - 1) {
                for (let horizontals of this.forAllHorizontalWalls()) {
                    yield *this.allMazesFromRow(row + 1);
                }
            } else {
                yield this;
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

// Count the number of mazes of size N.

