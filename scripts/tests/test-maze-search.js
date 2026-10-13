import { assert } from "chai";
import { Maze } from "../maze-generator.js";
import { searchMazes } from "../maze-search.js";
import { layoutGrid } from "../maze-layout.js";
suite("searchMazes", () => {
    test("3x3", () => {
        const result = searchMazes(3, 3);
        assert.equal(result.total, 192);
        assert.equal(result.unique, 28);
        assert.deepEqual(result.symCounts, { "1": 21, "2": 5, "4": 2, "8": 0 });
        assert.equal(result.wallCount, 12);
        assert.equal(result.walls.length, 28 * 12);
        assert.equal(result.symmetries.filter(s => s >= 2).length, 7);
    });
    test("matches countMazes", () => {
        for (let [rows, cols] of [[2, 2], [2, 3], [3, 2], [2, 4], [3, 4]]) {
            const result = searchMazes(rows, cols);
            const count = new Maze(rows, cols).countMazes();
            assert.equal(result.total, count.total, `${rows}x${cols} total`);
            assert.equal(result.unique, count.unique, `${rows}x${cols} unique`);
            assert.deepEqual(result.symCounts, count.symCounts, `${rows}x${cols} symCounts`);
        }
    });
    test("each maze has the walls of a spanning tree", () => {
        const result = searchMazes(3, 4);
        const maze = new Maze(3, 4);
        for (let i = 0; i < result.unique; i++) {
            const walls = result.walls.subarray(i * result.wallCount, (i + 1) * result.wallCount);
            maze.walls = Array.from(walls, w => w === 1);
            assert.equal(maze.numWalls, maze.completeWalls);
            assert.isTrue(maze.uniquelyConnected());
        }
    });
    test("progress", () => {
        const found = [];
        const result = searchMazes(3, 3, n => found.push(n), 50);
        assert.deepEqual(found, [50, 100, 150]);
        assert.equal(result.total, 192);
    });
});
suite("layoutGrid", () => {
    test("small sets form a square block", () => {
        const layout = layoutGrid(28, 3, 3, 710);
        assert.equal(layout.perRow, 6);
        assert.equal(layout.numRows, 5);
    });
    test("large sets wrap into a long list", () => {
        const layout = layoutGrid(12600, 4, 4, 710);
        assert.isBelow(layout.perRow, 113);
        assert.isAtLeast(layout.mazeSize[0], 40);
        assert.equal(layout.numRows, Math.ceil(12600 / layout.perRow));
        assert.equal(layout.height, layout.numRows * layout.step[1] - 6);
    });
    test("grid fits the width", () => {
        for (let width of [300, 500, 710]) {
            for (let count of [1, 7, 28, 112, 12600]) {
                const layout = layoutGrid(count, 4, 4, width);
                const gridWidth = layout.perRow * layout.step[0] - 6;
                assert.isAtMost(layout.offsetX + gridWidth, width, `${count} in ${width}`);
            }
        }
    });
    test("tall mazes fit their box", () => {
        const layout = layoutGrid(10, 4, 2, 710);
        assert.isAtMost(layout.mazeSize[0], layout.mazeSize[1]);
        assert.isAtMost(layout.mazeSize[1], 60 * 4);
    });
    test("no mazes", () => {
        const layout = layoutGrid(0, 4, 4, 710);
        assert.equal(layout.numRows, 0);
        assert.equal(layout.height, 0);
    });
});
//# sourceMappingURL=test-maze-search.js.map