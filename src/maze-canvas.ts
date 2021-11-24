export { MazeCanvas };

class MazeCanvas {
    walls: boolean[];
    rows: number;
    columns: number;

    wallBorder = 2;
    wallPadding = 2;
    borderColor = 'rgb(0, 0, 0)';
    cellColor = 'rgb(255, 255, 255)';

    mazeSize: [number, number] = [10, 10];

    constructor(rows: number, columns: number, walls: boolean[]) {
        this.rows = rows;
        this.columns = columns;
        this.walls = walls;
    }

    setWalls(walls: boolean[]) {
        this.walls = walls;
    }

    sizeFromWidth(width: number) {
        const borderExtra = this.wallBorder + this.wallPadding;
        const cellSize = Math.floor((width - borderExtra) / this.columns) - borderExtra;

        this.mazeSize = [this.columns * (cellSize + borderExtra) + borderExtra,
                         this.rows * (cellSize + borderExtra) + borderExtra];
    }

    drawMaze(ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = this.wallBorder;
        ctx.strokeStyle = this.borderColor;
        ctx.fillStyle = this.cellColor;
        ctx.rect(0, 0, this.mazeSize[0], this.mazeSize[1]);
        ctx.fill();
        ctx.stroke();
    }
}
