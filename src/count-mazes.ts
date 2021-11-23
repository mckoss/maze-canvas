#!/usr/bin/env node

import { argv, hrtime } from 'process';

import { Maze } from './maze-generator.js';
import { pluralize } from './util.js';

let args = argv.slice(2);
let showSym = false;
let showUnique = false;
let rows = 0;
let cols = 0;

for (let arg of args) {
    if (arg.slice(0, 2) === '--') {
        if (arg.slice(2) === 'help') {
            help();
        } else if (arg.slice(2) === 'sym') {
            showSym = true;
        } else if (arg.slice(2) === 'unique') {
            showUnique = true;
        } else {
            help(`Unknown option: ${arg}`);
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

if (rows === 0) {
    help(`Missing maze size`);
}

console.log("Calculating...");

const maze = new Maze(rows, cols);

const wallCount = maze.walls.length;
const walls = maze.completeWalls;
const candidates = binomial(wallCount, walls);

console.log(`There are binom(${wallCount}, ${walls}) = ` +
    `${candidates.toLocaleString()} possible wall placements.`);

const estSecs = candidates/16/50000;
if (estSecs > 3600) {
    console.log(`Estimated time: ${(estSecs/3600).toFixed(1)} hours`);
} else if (estSecs > 60) {
    console.log(`Estimated time: ${(estSecs/60).toFixed(1)} minutes`);
} else if (estSecs > 15) {
    console.log(`Estimated time: ${Math.round(estSecs)} seconds.`);
}

const startTime = hrtime();
const counts = maze.countMazes();
const elapsedSeconds = hrSeconds(hrtime(startTime));

console.log(`There are ${counts.total.toLocaleString()} mazes of size ${rows}x${cols}.`);
console.log(`${pluralize(counts.unique, 'is', 'are')} unique:`);
console.log('---')
console.log(`${pluralize(counts.symCounts["1"], 'is', 'are')} not symmetric.`);
console.log(`${pluralize(counts.symCounts["2"], 'has', 'have')} 2-way symmetry.`);
console.log(`${pluralize(counts.symCounts["4"], 'has', 'have')} 4-way symmetry.`);

if (maze.isSquare) {
    console.log(`${pluralize(counts.symCounts["8"], 'has', 'have')} 8-way symmetry.`);
}

if (showUnique || showSym) {
    for (let m of maze.allMazes(true)) {
        if (!m.isCanonical) {
            continue;
        }
        if (!showUnique && m.symmetry === "1") {
            continue;
        }
        console.log(`${m.toString().slice(0, -1)}${m.symmetry !== "1" ? ` (${m.symmetry})` : ''}`);
    }
}

console.log(`\nOne in ${(candidates/counts.total).toFixed(1)} of the wall placements are valid mazes.`);

console.log(`---\nElapsed time: ${elapsedSeconds.toFixed(1)}s`);
console.log(`${Math.floor(counts.total/elapsedSeconds).toLocaleString()} mazes per second.`);

function hrSeconds(hrtime: [number, number]) {
  return hrtime[0] + hrtime[1] / 1e9;
}

function help(err?: string) {
    if (err) {
        console.error(err);
        console.log('');
    }

    console.log("Usage: count-mazes.js [--sym] <rows> [<cols>]");
    console.log(" --sym: Print all symmetrical mazes.");
    console.log(" --unique: Print all (unique) mazes.");
    console.log(" <rows>: Number of rows in the maze");
    console.log(" <cols>: Number of columns in the maze (same as rows if not given)");
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
