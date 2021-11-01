import { assert } from "chai";

import { tuples } from "../maze-generator.js";

suite("tuples", () => {
    test("various", () => {
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
                i += 1;
            }
            assert.equal(i, t[1].length, `Expected ${t[1].length} tuples (only got ${i})`);
        }
    });
});
