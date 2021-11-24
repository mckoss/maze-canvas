export { MazeCanvas };

class MazeCanvas {
    walls: boolean[];
    rows: number;
    columns: number;

    wallBorder = 6;
    wallPadding = 15;
    borderColor = 'rgb(0, 0, 0)';
    cellColor = 'rgb(255, 255, 255)';

    cellSize: number = 0;
    cellStep: number = 0;
    mazeSize: [number, number] = [0, 0];

    constructor(rows: number, columns: number, walls: boolean[]) {
        this.rows = rows;
        this.columns = columns;
        this.walls = walls;
    }

    setWalls(walls: boolean[]) {
        this.walls = walls;
    }

    sizeFromWidth(width: number) {
        const outerSpace = 2 * this.wallBorder;

        // Wall borders are doubled up with wallPadding is non-zero.
        let innerSpace: number;
        if (this.wallPadding === 0) {
            innerSpace = this.wallBorder;
        } else {
            innerSpace = 2 * this.wallBorder + this.wallPadding;
        }

        // Determine the maximum cellSize that will fit in the given width:
        // width = columns * cellSize + (columns - 1) * innerSpace + outerSpace
        // so cellSize = (width - outerSpace - (columns - 1) * innerSpace) / columns
        // or cellSize = (width - outerSpace + innerSpace) / columns - innerSpace

        this.cellSize = Math.floor((width - outerSpace + innerSpace) / this.columns) - innerSpace;

        this.mazeSize = [
            this.columns * this.cellSize + (this.columns - 1) * innerSpace + outerSpace,
            this.rows * this.cellSize + (this.rows - 1) * innerSpace + outerSpace
        ];

        this.cellStep = this.cellSize + innerSpace;

        console.log(`${width} => ${this.mazeSize} (${this.cellSize})`);
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
    }
}
