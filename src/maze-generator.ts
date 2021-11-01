export { tuples };

class Cell {
    right: boolean = false;
    bottom: boolean = false;
    partition: number = 0;
}

function *mazes(rows: number, cols: number): Generator<Cell[][]> {
    let mazeRows: Cell[][] = [];

    yield *generateFromRow(0, rows, cols, mazeRows);
}

function* generateFromRow(row: number, rows: number, cols: number,
    mazeRows: Cell[][]): Generator<Cell[][]> {

    for (let cells of allPossibleRows(cols, row === rows - 1)) {
        mazeRows.push(cells);
        if (isViable(cells, row > 0 ? mazeRows[row - 1] : null)) {
            if (row === rows - 1) {
                yield mazeRows;
            } else {
                yield *generateFromRow(row + 1, rows, cols, mazeRows);
            }
        }
    }
}

function *allPossibleRows(cols: number, bottomRow: boolean): Generator<Cell[]> {
    let cells = Array.from({ length: cols}, () => new Cell());
}

// Return true if this row is viable.
// If any cells are totall enclosed - it is not viable.
// Modifiy the row with partition numbers - collapsing to the lowest
// number possible.
// The last row must collapse to a single partition.
// Any stranded partition (one without any hope of reaching the last
// row) also makes a partition non-viable.
function isViable(cells: Cell[], priorCells: Cell[] | null): boolean {
    return false;
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
