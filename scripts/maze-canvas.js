export { MazeCanvas };
class MazeCanvas {
    constructor(rows, columns, walls) {
        this.wallBorder = 2;
        this.wallPadding = 2;
        this.borderColor = 'rgb(0, 0, 0)';
        this.cellColor = 'rgb(255, 255, 255)';
        this.mazeSize = [10, 10];
        this.rows = rows;
        this.columns = columns;
        this.walls = walls;
    }
    setWalls(walls) {
        this.walls = walls;
    }
    sizeFromWidth(width) {
        const borderExtra = this.wallBorder + this.wallPadding;
        const cellSize = Math.floor((width - borderExtra) / this.columns) - borderExtra;
        this.mazeSize = [this.columns * (cellSize + borderExtra) + borderExtra,
            this.rows * (cellSize + borderExtra) + borderExtra];
    }
    drawMaze(ctx) {
        ctx.lineWidth = this.wallBorder;
        ctx.strokeStyle = this.borderColor;
        ctx.fillStyle = this.cellColor;
        ctx.rect(0, 0, this.mazeSize[0], this.mazeSize[1]);
        ctx.fill();
        ctx.stroke();
    }
}
//# sourceMappingURL=maze-canvas.js.map