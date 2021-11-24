var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Maze_symmetry, _Maze_isCanonical;
export { tuples, Maze, Direction, TESTING };
// Exposed for testing - not part of the public API.
const TESTING = { compose, oppositeDir, rotateDir, reflectHDir, reflectVDir };
var Direction;
(function (Direction) {
    Direction[Direction["up"] = 0] = "up";
    Direction[Direction["right"] = 1] = "right";
    Direction[Direction["down"] = 2] = "down";
    Direction[Direction["left"] = 3] = "left";
})(Direction || (Direction = {}));
function oppositeDir(dir) {
    return (dir + 2) % 4;
}
// Rotate clockwise 90 degrees.
function rotateDir(dir) {
    return (dir + 1) % 4;
}
// Reflection across vertical axis.
function reflectHDir(dir) {
    return [Direction.up, Direction.left, Direction.down, Direction.right][dir];
}
// Reflect across horizontal axis.
function reflectVDir(dir) {
    return [Direction.down, Direction.right, Direction.up, Direction.left][dir];
}
// Differential index in row cells and column cells.
const dcell = [
    [-1, 0], [0, 1], [1, 0], [0, -1]
];
class Maze {
    constructor(rows, cols) {
        _Maze_symmetry.set(this, void 0);
        _Maze_isCanonical.set(this, void 0);
        // The 7 transforms of wall indices rotating and
        // horizontal reflection.
        // r1, r2, r3, h, h.r1, h.r2, h.r3
        this.transforms = [];
        this.rows = rows;
        this.cols = cols;
        this.completeWalls = rows * cols - rows - cols + 1;
        this.cells = new Array(rows * cols).fill(0);
        this.walls = new Array(rows * (cols - 1) + cols * (rows - 1)).fill(false);
        this.calcTransforms();
    }
    get isSquare() {
        return this.rows === this.cols;
    }
    calcTransforms() {
        if (this.isSquare) {
            let r1 = [];
            let horiz = [];
            for (let coords of this.allWallCoords()) {
                r1.push(this.wallIndex(...this.rot(...coords)));
                horiz.push(this.wallIndex(...this.reflectH(...coords)));
            }
            const r2 = compose(r1, r1);
            const r3 = compose(r2, r1);
            this.transforms.push(r1, r2, r3);
            this.transforms.push(horiz);
            for (let i = 0; i < 3; i++) {
                this.transforms.push(compose(horiz, this.transforms[i]));
            }
        }
        else {
            let horiz = [];
            let vert = [];
            for (let coords of this.allWallCoords()) {
                horiz.push(this.wallIndex(...this.reflectH(...coords)));
                vert.push(this.wallIndex(...this.reflectV(...coords)));
            }
            this.transforms.push(horiz);
            this.transforms.push(vert);
            this.transforms.push(compose(horiz, vert));
        }
    }
    clone() {
        let m = new Maze(this.rows, this.cols);
        m.walls = this.walls.slice();
        __classPrivateFieldSet(m, _Maze_symmetry, __classPrivateFieldGet(this, _Maze_symmetry, "f"), "f");
        __classPrivateFieldSet(m, _Maze_isCanonical, __classPrivateFieldGet(this, _Maze_isCanonical, "f"), "f");
        return m;
    }
    rot(row, col, dir) {
        if (this.rows !== this.cols) {
            throw new Error('Cannot rotate non-square maze');
        }
        return [col, this.rows - row - 1, rotateDir(dir)];
    }
    reflectH(row, col, dir) {
        return [row, this.cols - col - 1, reflectHDir(dir)];
    }
    reflectV(row, col, dir) {
        return [this.rows - row - 1, col, reflectVDir(dir)];
    }
    countMazes() {
        let total = 0;
        let symCounts = {
            "1": 0,
            "2": 0,
            "4": 0,
            "8": 0
        };
        for (let m of this.allMazes(true)) {
            total++;
            symCounts[m.symmetry] += 1;
        }
        // Remove duplicated counts from symCounts
        if (this.isSquare) {
            symCounts["1"] /= 8;
            symCounts["2"] /= 4;
            symCounts["4"] /= 2;
        }
        else {
            symCounts["1"] /= 4;
            symCounts["2"] /= 2;
        }
        let unique = symCounts["1"] + symCounts["2"] + symCounts["4"] + symCounts["8"];
        return { total, unique, symCounts };
    }
    *allMazes(calcSym = false) {
        for (let maze of this.allMazesFromRow(0)) {
            if (calcSym) {
                maze.calcSym();
            }
            yield maze;
        }
    }
    get symmetry() {
        if (__classPrivateFieldGet(this, _Maze_symmetry, "f") === undefined) {
            this.calcSym();
        }
        return __classPrivateFieldGet(this, _Maze_symmetry, "f");
    }
    get isCanonical() {
        if (__classPrivateFieldGet(this, _Maze_isCanonical, "f") === undefined) {
            this.calcSym();
        }
        return __classPrivateFieldGet(this, _Maze_isCanonical, "f");
    }
    calcSym() {
        let sym = 1;
        let isCanonical = true;
        for (let t of this.transforms) {
            if (this.walls.every((w, i) => {
                if (w !== this.walls[t[i]]) {
                    if (isCanonical && w && !this.walls[t[i]]) {
                        isCanonical = false;
                    }
                    return false;
                }
                return true;
            })) {
                sym++;
            }
        }
        __classPrivateFieldSet(this, _Maze_symmetry, sym, "f");
        __classPrivateFieldSet(this, _Maze_isCanonical, isCanonical, "f");
    }
    get numWalls() {
        return this.walls.reduce((acc, cur) => acc + (cur ? 1 : 0), 0);
    }
    *allMazesFromRow(row) {
        for (let verticals of this.forAllVerticalWalls()) {
            copyTo(this.walls, this.wallIndex(row, 0, Direction.right), verticals);
            if (row < this.rows - 1) {
                for (let horizontals of this.forAllHorizontalWalls()) {
                    copyTo(this.walls, this.wallIndex(row, 0, Direction.down), horizontals);
                    if (!this.allHaveExit(row)) {
                        continue;
                    }
                    yield* this.allMazesFromRow(row + 1);
                }
            }
            else {
                if (this.uniquelyConnected()) {
                    yield this;
                }
            }
        }
    }
    *forAllVerticalWalls() {
        for (let t of tuples(2, this.cols - 1)) {
            yield t.map(x => x !== 0);
        }
    }
    *forAllHorizontalWalls() {
        for (let t of tuples(2, this.cols)) {
            yield t.map(x => x !== 0);
        }
    }
    cellIndex(row, col) {
        return row * this.cols + col;
    }
    neighborIndex(row, col, dir) {
        row += dcell[dir][0];
        col += dcell[dir][1];
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return -1;
        }
        return this.cellIndex(row, col);
    }
    setWall(row, col, dir, value = true) {
        const index = this.wallIndex(row, col, dir);
        if (index === -1) {
            return;
        }
        this.walls[index] = value;
    }
    hasWall(row, col, dir) {
        const index = this.wallIndex(row, col, dir);
        if (index === -1) {
            return true;
        }
        return this.walls[index];
    }
    wallIndex(row, col, dir) {
        // Each row has cols - 1 vertical walls and cols horizontal walls.
        if (dir === Direction.up) {
            row--;
            if (row < 0) {
                return -1;
            }
            dir = Direction.down;
        }
        else if (dir === Direction.left) {
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
    *allWallCoords() {
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
    allHaveExit(lastRow) {
        let exitableCount = 0;
        let allCount = this.cellIndex(lastRow + 1, 0);
        let distances = new Array(allCount).fill(-1);
        // row, col
        let stack = [];
        for (let col = 0; col < this.cols; col++) {
            if (lastRow === this.rows - 1 ||
                !this.hasWall(lastRow, col, Direction.down)) {
                distances[this.cellIndex(lastRow, col)] = 0;
                exitableCount++;
                stack.push([lastRow, col]);
            }
        }
        while (stack.length > 0) {
            const [row, col] = stack.pop();
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
    uniquelyConnected() {
        const visited = new Array(this.cells.length).fill(false);
        let count = 0;
        const stack = [];
        // Pretend we're starting from above the maze.
        stack.push([0, 0, Direction.up]);
        visited[0] = true;
        count++;
        while (stack.length > 0) {
            const [row, col, fromDir] = stack.pop();
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
    toString() {
        let result = '';
        result += '.' + '_.'.repeat(this.cols) + '\n';
        for (let row = 0; row < this.rows; row++) {
            result += '|';
            for (let col = 0; col < this.cols; col++) {
                if (this.hasWall(row, col, Direction.right)) {
                    result += ' |';
                }
                else {
                    result += '  ';
                }
            }
            result += '\n.';
            for (let col = 0; col < this.cols; col++) {
                if (this.hasWall(row, col, Direction.down)) {
                    result += '_.';
                }
                else {
                    result += ' .';
                }
            }
            result += '\n';
        }
        return result;
    }
}
_Maze_symmetry = new WeakMap(), _Maze_isCanonical = new WeakMap();
function* tuples(maxValue, values) {
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
function copyTo(dest, iDest, src) {
    for (let i = 0; i < src.length; i++) {
        dest[iDest + i] = src[i];
    }
}
// Compose two mapping arrays to form a new mapping array.
// The indices of the sccond array are applied first to yield
// indices into the first array (e.g. compose a with b).
// c[x] = a[b[x]]
function compose(a, b) {
    let c = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        c[i] = a[b[i]];
    }
    return c;
}
//# sourceMappingURL=maze-generator.js.map