export { MazeCanvas };
class MazeCanvas {
    constructor(rows, columns, walls) {
        this.wallBorder = 4;
        this.wallPadding = 8;
        this.borderColor = 'rgb(0, 0, 0)';
        this.cellColor = 'rgb(255, 255, 255)';
        this.backgroundColor = 'red';
        this.cellSize = 0;
        this.cellStep = 0;
        this.mazeSize = [0, 0];
        this.rows = rows;
        this.columns = columns;
        this.walls = walls;
    }
    setWalls(walls) {
        this.walls = walls;
    }
    sizeFromWidth(width) {
        const outerSpace = 2 * this.wallBorder;
        // Wall borders are doubled up with wallPadding is non-zero.
        let innerSpace;
        if (this.wallPadding === 0) {
            innerSpace = this.wallBorder;
        }
        else {
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
    drawMaze(ctx) {
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
        let cellDistance;
        if (this.wallPadding === 0) {
            cellDistance = this.wallBorder;
        }
        else {
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
                    ctx.rect(x + this.wallBorder + this.cellSize, y + this.wallBorder, cellDistance, this.cellSize);
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
                    ctx.rect(x + this.wallBorder, y + this.wallBorder + this.cellSize, this.cellSize, cellDistance);
                    ctx.closePath();
                    ctx.fill();
                }
                wallIndex++;
            }
        }
    }
}
//# sourceMappingURL=maze-canvas.js.map