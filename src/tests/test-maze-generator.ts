import { assert } from "chai";

import { tuples, Maze, MazeCount, Direction, TESTING }
from "../maze-generator.js";

import { pluralize, binomial } from '../util.js';

const { compose, oppositeDir, rotateDir, reflectHDir, reflectVDir } = TESTING;

suite("Maze", () => {
    test("constructor", () => {
        const maze = new Maze(4, 4);
        assert.equal(maze.cols, 4);
        assert.equal(maze.rows, 4);
    });

    test("clone", () => {
        const maze = new Maze(4, 4);
        maze.setWall(1, 1, Direction.right);
        maze.setWall(1, 1, Direction.down);
        const clone = maze.clone();

        assert.equal(maze.cols, clone.cols, 'cols');
        assert.equal(maze.rows, clone.rows, 'rows');
        assert.deepEqual(maze.transforms, clone.transforms, 'transforms');
        assert.equal(maze.symmetry, clone.symmetry, 'symmetry');
        assert.equal(maze.cells.length, clone.cells.length, 'cells length');
        assert.deepEqual(maze.walls, clone.walls, 'walls');
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

    test("countMazes", () => {
        const tests: [[number, number], MazeCount][] = [
            [ [1, 1], { total: 1, unique: 1,
                symCounts: {"1": 0, "2": 0, "4": 0, "8": 1}}],
            [ [2, 2], { total: 4, unique: 1,
                symCounts: {"1": 0, "2": 1, "4": 0, "8": 0}}],
            [ [3, 3], { total: 192, unique: 28,
                symCounts: {"1": 21, "2": 5, "4": 2, "8": 0}}],
            [ [1, 2], { total: 1, unique: 1,
                symCounts: {"1": 0, "2": 0, "4": 1, "8": 0}}],
            [ [2, 3], { total: 15, unique: 6,
                symCounts: {"1": 2, "2": 3, "4": 1, "8": 0}}],
            // [ [4, 4], 100352],
        ];

        for (let test of tests) {
            const maze = new Maze(...test[0]);
            assert.deepEqual(maze.countMazes(), test[1], `${test[0]}: ${JSON.stringify(maze.countMazes(), undefined, 4)}`);
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

    test("reflect", () => {
        const maze = new Maze(3, 3);

        let hIndices = [];
        let vIndices = [];

        for (let coords of maze.allWallCoords()) {
            hIndices.push(maze.wallIndex(...maze.reflectH(...coords)));
            vIndices.push(maze.wallIndex(...maze.reflectV(...coords)));
        }

        assert.deepEqual(hIndices, [1, 0, 4, 3, 2, 6, 5, 9, 8, 7, 11, 10]);
        assert.deepEqual(vIndices, [10, 11, 7, 8, 9, 5, 6, 2, 3, 4, 0, 1]);
    });

    test("transforms", () => {
        const maze = new Maze(1, 1);
        assert.equal(maze.transforms.length, 7);
        assert.deepEqual(maze.transforms, [[],[],[],[],[],[],[]]);

        // Square maze examples.
        for (let size = 2; size < 5; size++) {
            const numLocations = 2 * (size ** 2 - size);
            const maze = new Maze(size, size);
            assert.equal(maze.transforms.length, 7);
            const r1 = maze.transforms[0];
            const h = maze.transforms[3];
            testPermutation(maze.transforms[0], numLocations, 4); // r1
            testPermutation(maze.transforms[1], numLocations, 2); // r2
            testPermutation(maze.transforms[2], numLocations, 4); // r3
            testPermutation(maze.transforms[3], numLocations, 2); // h
            testPermutation(maze.transforms[4], numLocations, 2); // h r1
            testPermutation(maze.transforms[5], numLocations, 2); // h r2
            testPermutation(maze.transforms[6], numLocations, 2); // h r3
        }

        // Reflections only for non-square mazes.
        const mazeRect = new Maze(2, 3);
        const numLocations = 7;
        assert.equal(mazeRect.transforms.length, 3);
        for (const t of mazeRect.transforms) {
            testPermutation(t, numLocations, 2);
        }

        assert.deepEqual(mazeRect.transforms[0], [1, 0, 4, 3, 2, 6, 5]);
        assert.deepEqual(mazeRect.transforms[1], [5, 6, 2, 3, 4, 0, 1]);
        assert.deepEqual(mazeRect.transforms[2], [6, 5, 4, 3, 2, 1, 0]);

        // Ensure each permutation is:
        // - The right size
        // - Has all the integers from 0 .. n - 1
        // - Generate the identity in the expected order when composed
        //   with itself.
        function testPermutation(perm: number[], n: number, order: number) {
            assert.equal(perm.length, n, `length`);
            let elements = perm.slice();
            elements.sort((a, b) => a - b);
            assert.deepEqual(elements, [...Array(n).keys()], `${elements} all integers`);

            elements = perm.slice();
            for (let i = 1; i < order; i++) {
                elements = compose(perm, elements);
            }
            assert.deepEqual(elements, [...Array(n).keys()], `${elements} order`);
        }
    });
});

suite("misc", () => {
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

    test("rotateDir", () => {
        const tests = [
            [ Direction.up, Direction.right ],
            [ Direction.right, Direction.down ],
            [ Direction.down, Direction.left ],
            [ Direction.left, Direction.up ],
        ];

        for (let test of tests) {
            assert.equal(rotateDir(test[0]), test[1]);
        }
    });

    test("reflectHDir", () => {
        const tests = [
            [ Direction.up, Direction.up ],
            [ Direction.right, Direction.left ],
            [ Direction.down, Direction.down ],
            [ Direction.left, Direction.right ],
        ];

        for (let test of tests) {
            assert.equal(reflectHDir(test[0]), test[1]);
        }
    });

    test("reflectVDir", () => {
        const tests = [
            [ Direction.up, Direction.down ],
            [ Direction.right, Direction.right ],
            [ Direction.down, Direction.up ],
            [ Direction.left, Direction.left ],
        ];

        for (let test of tests) {
            assert.equal(reflectVDir(test[0]), test[1]);
        }
    });

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

    test("compose", () => {
        const r1 = [1, 3, 0, 2];
        const r2 = compose(r1, r1);
        const h = [1, 0, 3, 2];
        const tests: [ [number[], number[]], number[]][] = [
            [ [[], []], [] ],
            [ [[2, 1, 0], [2, 1, 0]], [0, 1, 2] ],
            [ [h, r1], [0, 2, 1, 3] ],
            [ [h, h], [0, 1, 2, 3] ],
            [ [r2, r2], [0, 1, 2, 3] ],
            [ [r1, compose(r1, r2)], [0, 1, 2, 3] ],
        ];
        for (let test of tests) {
            assert.deepEqual(compose(...test[0]), test[1], `${test}`);
        }
    });

    test("pluralize", () => {
        const tests: [[number, string, string?], string][] = [
            [[1, "thing"], "1 thing"],
            [[0, "thing"], "0 things"],
            [[2, "thing"], "2 things"],
            [[0, "has", "have"], "0 have"],
            [[1, "has", "have"], "1 has"],
            [[2, "has", "have"], "2 have"],
            [[10000, "cookie"], "10,000 cookies"],
        ];

        for (let test of tests) {
            assert.equal(pluralize(...test[0]), test[1], `${test}`);
        }
    });

    test("binomial", () => {
        const tests: [[number, number], number][] = [
            [[0, 0], 1],
            [[0, 1], 0],
            [[1, 0], 1],
            [[1, 1], 1],
            [[2, 0], 1],
            [[5, 2], 10],
            [[10, 5], 252],
        ];

        for (let test of tests) {
            assert.equal(binomial(...test[0]), test[1], `${test}`);
        }
    });
});
