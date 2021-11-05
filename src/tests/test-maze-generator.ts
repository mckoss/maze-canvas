import { assert } from "chai";

import { tuples, Maze, Direction, oppositeDir } from "../maze-generator.js";

suite("Maze", () => {
    test("oppositeDir", () => {
        const tests = [
            [ Direction.up, Direction.down ],
            [ Direction.right, Direction.left ],
        ];

        for (let test of tests) {
            assert.equal(oppositeDir(test[0]), test[1]);
            assert.equal(oppositeDir(test[1]), test[0]);
        }
    });

    test("constructor", () => {
        const maze = new Maze(4, 4);
        assert.equal(maze.cols, 4);
        assert.equal(maze.rows, 4);
    });

    test("cellIndex", () => {
        const maze = new Maze(4, 4);
        assert.equal(maze.cellIndex(0, 0), 0);
        assert.equal(maze.cellIndex(1, 0), 4);
        assert.equal(maze.cellIndex(0, 1), 1);
        assert.equal(maze.cellIndex(1, 1), 5);
    });

    test("neighborIndex", () => {
        const tests: [[number, number, Direction], number][] = [
            [ [0, 0, Direction.right], 1 ],
            [ [0, 1, Direction.right], 2 ],
            [ [0, 0, Direction.down], 4 ],
            [ [0, 1, Direction.down], 5 ],
            [ [1, 0, Direction.right], 5 ],
            [ [1, 1, Direction.right], 6 ],
            [ [1, 0, Direction.down], 8 ],

            [ [0, 0, Direction.left], -1 ],
            [ [0, 1, Direction.left], 0 ],
            [ [0, 0, Direction.up], -1 ],
            [ [0, 1, Direction.up], -1 ],
            [ [1, 0, Direction.left], -1 ],
            [ [1, 1, Direction.left], 4 ],
            [ [1, 0, Direction.up], 0 ],
        ];

        const maze = new Maze(4, 4);
        for (let test of tests) {
            assert.equal(maze.neighborIndex(...test[0]), test[1], `${test[0]}`);
        }
    });

    test("wallIndex", () => {
        const tests: [[number, number, Direction], number][] = [
            [ [0, 0, Direction.right], 0 ],
            [ [0, 1, Direction.right], 1 ],
            [ [0, 0, Direction.down], 3 ],
            [ [0, 1, Direction.down], 4 ],
            [ [1, 0, Direction.right], 7 ],
            [ [1, 1, Direction.right], 8 ],
            [ [1, 0, Direction.down], 10 ],

            [ [0, 0, Direction.left], -1 ],
            [ [0, 1, Direction.left], 0 ],
            [ [0, 0, Direction.up], -1 ],
            [ [0, 1, Direction.up], -1 ],
            [ [1, 0, Direction.left], -1 ],
            [ [1, 1, Direction.left], 7 ],
            [ [1, 0, Direction.up], 3 ],
        ];

        const maze = new Maze(4, 4);
        for (let test of tests) {
            assert.equal(maze.wallIndex(...test[0]), test[1], `${test[0]}`);
        }
    });

    test("setWall / hasWall", () => {
        const maze = new Maze(4, 4);

        assert.equal(maze.numWalls, 0);

        maze.setWall(1, 0, Direction.right, true);
        maze.setWall(1, 1, Direction.down, true);

        assert.equal(maze.numWalls, 2);

        const tests: [[number, number, Direction], boolean][] = [
            [ [0, 0, Direction.up], true ],
            [ [0, 0, Direction.right], false ],
            [ [0, 0, Direction.down], false ],
            [ [0, 0, Direction.left], true ],

            [ [0, 1, Direction.up], true ],
            [ [0, 1, Direction.right], false ],
            [ [0, 1, Direction.down], false ],
            [ [0, 1, Direction.left], false ],

            [ [1, 0, Direction.up], false ],
            [ [1, 0, Direction.right], true ],
            [ [1, 0, Direction.down], false ],
            [ [1, 0, Direction.left], true ],

            [ [1, 1, Direction.up], false ],
            [ [1, 1, Direction.right], false ],
            [ [1, 1, Direction.down], true ],
            [ [1, 1, Direction.left], true ],

            [ [0, 3, Direction.right], true ],
            [ [1, 3, Direction.right], true ],
            [ [3, 0, Direction.down], true ],
            [ [3, 3, Direction.down], true ],
        ];

        for (let test of tests) {
            assert.equal(maze.hasWall(...test[0]), test[1], `${test[0]}`);
        }
    });

    test("forAllVerticalWalls", () => {
        const maze = new Maze(4, 4);
        const expected = [
            [false, false, false],
            [false, false, true],
            [false, true, false],
            [false, true, true],
            [true, false, false],
            [true, false, true],
            [true, true, false],
            [true, true, true]];

        let i = 0;
        for (let row of maze.forAllVerticalWalls()) {
            assert.deepEqual(row, expected[i++]);
        }
        assert.equal(i, expected.length);
    });

    test("forAllHorizontalWalls", () => {
        const maze = new Maze(4, 4);
        const expected = [
            [false, false, false, false],
            [false, false, false, true],
            [false, false, true, false],
            [false, false, true, true],
            [false, true, false, false],
            [false, true, false, true],
            [false, true, true, false],
            [false, true, true, true],
            [true, false, false, false],
            [true, false, false, true],
            [true, false, true, false],
            [true, false, true, true],
            [true, true, false, false],
            [true, true, false, true],
            [true, true, true, false],
            [true, true, true, true]];

        let i = 0;
        for (let row of maze.forAllHorizontalWalls()) {
            assert.deepEqual(row, expected[i++]);
        }
        assert.equal(i, expected.length);
    });

    test("allMazes", () => {
        const tests: [[number, number], number][] = [
            [ [1, 1], 1],
            [ [2, 2], 4],
            [ [3, 3], 192],
            // [ [4, 4], 100352],
        ];

        for (let test of tests) {
            const maze = new Maze(...test[0]);
            assert.equal(maze.countMazes(), test[1]);
        }
    });

    test("allHaveExit", () => {
        const maze = new Maze(1, 1);
        assert.equal(maze.allHaveExit(0), true);

        const maze2 = new Maze(2, 2);
        assert.equal(maze2.allHaveExit(0), true);

        maze2.setWall(0, 0, Direction.right, true);
        assert.equal(maze2.allHaveExit(0), true);
        assert.equal(maze2.allHaveExit(1), true);

        maze2.setWall(0, 1, Direction.down, true);
        assert.equal(maze2.allHaveExit(0), false);
        assert.equal(maze2.allHaveExit(1), false);

        maze2.setWall(0, 0, Direction.right, false);
        assert.equal(maze2.allHaveExit(0), true, JSON.stringify(maze2));
        assert.equal(maze2.allHaveExit(1), true, JSON.stringify(maze2));

        let maze3 = new Maze(3, 3);
        maze3.setWall(0, 1, Direction.down);
        maze3.setWall(1, 1, Direction.down);
        maze3.setWall(1, 2, Direction.down);
        maze3.setWall(2, 0, Direction.right);
        for (let row of [0, 1, 2]) {
            assert.equal(maze3.allHaveExit(row), true);
        }
    });

    test("uniquelyConnected", () => {
        let maze3 = new Maze(3, 3);
        maze3.setWall(0, 1, Direction.down);
        maze3.setWall(1, 1, Direction.down);
        maze3.setWall(1, 2, Direction.down);
        maze3.setWall(2, 0, Direction.right);
        assert.equal(maze3.uniquelyConnected(), false);
    });
});

suite("iterators", () => {
    test("tuples", () => {
        const tests: [[number, number], number[][]][] = [
            [ [0, 0], [[]] ],
            [ [1, 1], [[0]] ],
            [ [1, 2], [[0, 0]] ],
            [ [2, 1], [[0], [1]] ],
            [ [2, 2], [[0, 0], [0, 1], [1, 0], [1, 1]] ],
            [ [5, 1], [[0], [1], [2], [3], [4]] ],
        ];

        for (let t of tests) {
            let i = 0;
            for (let tup of tuples(...t[0])) {
                if (i >= t[1].length) {
                    assert.fail(`Too many tuples from tuples(${t[0]})`);
                }
                assert.deepEqual(tup, t[1][i], `Iteration #${i} of tuples(${t[0]})`);
                i++;
            }
            assert.equal(i, t[1].length, `Expected ${t[1].length} tuples (only got ${i})`);
        }
    });
});
