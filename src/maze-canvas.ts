export { MazeCanvas };

// Walls are listed as in Maze (true or 1 = wall present).
type Walls = ArrayLike<boolean | number>;

class MazeCanvas {
    walls: Walls;
    rows: number;
    columns: number;

    wallBorder = 4;
    wallPadding = 8;
    borderColor = 'rgb(0, 0, 0)';
    cellColor = 'rgb(255, 255, 255)';
    backgroundColor = 'red';

    cellSize: number = 0;
    cellStep: number = 0;
    mazeSize: [number, number] = [0, 0];

    constructor(rows: number, columns: number, walls: Walls) {
        this.rows = rows;
        this.columns = columns;
        this.walls = walls;
    }

    setWalls(walls: Walls) {
        this.walls = walls;
    }

    // Size the maze to fit within width x height, scaling the wall
    // thickness with the maze so walls stay visible when mazes are small.
    scaleToFit(width: number, height: number) {
        // With wallPadding = 2 * wallBorder and cells about 6 borders wide,
        // a maze of n cells spans about (10n - 2) borders.
        this.wallBorder = Math.max(1, Math.floor(Math.min(
            width / (10 * this.columns - 2),
            height / (10 * this.rows - 2))));
        this.wallPadding = 2 * this.wallBorder;

        const outerSpace = 2 * this.wallBorder;
        const innerSpace = 2 * this.wallBorder + this.wallPadding;

        // size = cells * cellSize + (cells - 1) * innerSpace + outerSpace
        this.cellSize = Math.max(1, Math.floor(Math.min(
            (width - outerSpace + innerSpace) / this.columns,
            (height - outerSpace + innerSpace) / this.rows)) - innerSpace);

        this.mazeSize = [
            this.columns * this.cellSize + (this.columns - 1) * innerSpace + outerSpace,
            this.rows * this.cellSize + (this.rows - 1) * innerSpace + outerSpace
        ];

        this.cellStep = this.cellSize + innerSpace;
    }

    drawMaze(ctx: CanvasRenderingContext2D) {
        const borderedSize = this.cellSize + 2 * this.wallBorder;
        const cellOffset = this.wallBorder;

        for (let row = 0; row < this.rows; row++) {
            const y = row * this.cellStep;

            for (let column = 0; column < this.columns; column++) {
                const x = column * this.cellStep;

            ctx.fillStyle = this.borderColor;
            ctx.beginPath();
            ctx.rect(x, y, borderedSize, borderedSize);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = this.cellColor;
            ctx.beginPath();
            ctx.rect(x + cellOffset, y + cellOffset, this.cellSize, this.cellSize);
            ctx.closePath();
            ctx.fill();
            }
        }

        let cellDistance: number;
        if (this.wallPadding === 0) {
            cellDistance = this.wallBorder;
        } else {
            cellDistance = 2 * this.wallBorder + this.wallPadding;
        }

        let wallIndex = 0;
        for (let row = 0; row < this.rows; row++) {
            const y = row * this.cellStep;

            // Connect the cells in this row.
            for (let column = 0; column < this.columns - 1; column++) {
                const x = column * this.cellStep;

                // Connect to cell to the right
                if (!this.walls[wallIndex]) {
                    ctx.fillStyle = this.borderColor;
                    ctx.beginPath();
                    ctx.rect(x + borderedSize, y, this.wallPadding, borderedSize);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = this.cellColor;
                    ctx.beginPath();
                    ctx.rect(x + this.wallBorder + this.cellSize, y + this.wallBorder,
                        cellDistance, this.cellSize);
                    ctx.closePath();
                    ctx.fill();
                }
                wallIndex++;
            }

            if (row === this.rows - 1) {
                break;
            }

            for (let column = 0; column < this.columns; column++) {
                const x = column * this.cellStep;

                // Connect to cell below
                if (!this.walls[wallIndex]) {
                    ctx.fillStyle = this.borderColor;
                    ctx.beginPath();
                    ctx.rect(x, y + borderedSize, borderedSize, this.wallPadding);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = this.cellColor;
                    ctx.beginPath();
                    ctx.rect(x + this.wallBorder, y + this.wallBorder + this.cellSize,
                        this.cellSize, cellDistance);
                    ctx.closePath();
                    ctx.fill();
                }
                wallIndex++;
            }
        }
    }
}
