#!/usr/bin/env node

import { argv, hrtime } from 'process';

import { Maze } from './maze-generator.js';

let args = argv.slice(2);
let showSym = false;
let rows = 0;
let cols = 0;

for (let arg of args) {
    if (arg.slice(0, 2) === '--') {
        if (arg.slice(2) === 'sym') {
            showSym = true;
        } else {
            console.error(`Unknown option: ${arg}`);
            help
        }
    } else {
        let value = parseInt(arg);
        if (isNaN(value) || value < 1) {
            help(`Invalid size: ${arg}`);
        }

        if (rows === 0) {
            rows = value;
        } else if (cols === 0) {
            cols = value;
        } else {
            help(`Too many sizes: ${arg}`);
        }
    }
}

if (cols === 0) {
    cols = rows;
}

console.log("Calculating...");

const maze = new Maze(rows, cols);

const wallCount = maze.walls.length;
const walls = maze.completeWalls;
const candidates = binomial(wallCount, walls);

console.log(`There are binom(${wallCount}, ${walls}) = ` +
    `${candidates.toLocaleString()} possible wall placements.`);

const estSecs = candidates/16/50000;
if (estSecs > 15) {
    console.log(`Estimated time: ${Math.round(estSecs)} seconds.`);
}

const startTime = hrtime();
const counts = maze.countMazes();
const elapsedSeconds = hrSeconds(hrtime(startTime));

console.log(`There are ${counts.total.toLocaleString()} mazes of size ${rows}x${cols}.`);
console.log(`${counts.unique.toLocaleString()} are unique:`);
console.log('---')
console.log(`${counts.symCounts["1"].toLocaleString()} are not symmetric.`);
console.log(`${counts.symCounts["2"].toLocaleString()} have 2-way symmetry.`);
console.log(`${counts.symCounts["4"]} have 4-way symmetry.`);
console.log(`${counts.symCounts["8"]} have 8-way symmetry.`);

console.log(`\nOne in ${(candidates/counts.total).toFixed(2)} of the wall placements are valid mazes.`);

console.log(`---\nElapsed time: ${elapsedSeconds.toFixed(2)}s`);
console.log(`${Math.floor(counts.total/elapsedSeconds).toLocaleString()} mazes per second.`);

function hrSeconds(hrtime: [number, number]) {
  return hrtime[0] + hrtime[1] / 1e9;
}

function help(err?: string) {
    if (err) {
        console.error(err);
    }

    console.log("\nUsage: count-mazes.js [--sym] <rows> [<cols>]");
    console.log(" --sym: Print all symmetrical mazes.");
    console.log(" <rows>: Number of rows in the maze (and cols if not given)");
    console.log(" <cols>: Number of columns in the maze");
    process.exit(1);
}

// Compute binomial coefficient (n choose k)
function binomial(n: number, k: number) {
    if (k > n) {
        return 0;
    }

    if (k > n - k) {
        k = n - k;
    }

    let result = 1;
    for (let i = 1; i <= k; ++i) {
        result *= n--;
        result /= i;
    }

    return result;
}
