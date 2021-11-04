import { assert } from "chai";

import { tuples, Maze, Direction } from "../maze-generator.js";

suite("Maze", () => {
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
        ];

        for (let test of tests) {
            const maze = new Maze(...test[0]);
            let count = 0;
            for (let m of maze.allMazes()) {
                console.log(m);
                count++;
            }
            assert.equal(count, 1);
        }
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

