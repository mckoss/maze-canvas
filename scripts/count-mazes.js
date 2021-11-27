#!/usr/bin/env node
import { argv, hrtime } from 'process';
import { Maze } from './maze-generator.js';
import { pluralize, binomial, Columnize } from './util.js';
let args = argv.slice(2);
let showSym = 0;
let showUnique = false;
let useBoxes = false;
let rows = 0;
let cols = 0;
for (let arg of args) {
    if (arg.slice(0, 2) === '--') {
        if (arg.slice(2) === 'help') {
            help();
        }
        else if (arg.slice(2) === 'boxes') {
            useBoxes = true;
        }
        else if (arg.slice(2, 6) === 'show') {
            if (arg.slice(6, 7) === '=') {
                showSym = parseInt(arg.slice(7), 10);
            }
            else {
                showSym = 1;
            }
        }
        else {
            help(`Unknown option: ${arg}`);
        }
    }
    else {
        let value = parseInt(arg);
        if (isNaN(value) || value < 1) {
            help(`Invalid size: ${arg}`);
        }
        if (rows === 0) {
            rows = value;
        }
        else if (cols === 0) {
            cols = value;
        }
        else {
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
const estSecs = candidates / 16 / 50000;
if (estSecs > 3600) {
    console.log(`Estimated time: ${(estSecs / 3600).toFixed(1)} hours`);
}
else if (estSecs > 60) {
    console.log(`Estimated time: ${(estSecs / 60).toFixed(1)} minutes`);
}
else if (estSecs > 15) {
    console.log(`Estimated time: ${Math.round(estSecs)} seconds.`);
}
const startTime = hrtime();
const counts = maze.countMazes();
const elapsedSeconds = hrSeconds(hrtime(startTime));
console.log(`There are ${counts.total.toLocaleString()} mazes of size ${rows}x${cols}.`);
console.log(`${pluralize(counts.unique, 'is', 'are')} unique:`);
console.log('---');
const headings = [];
headings[1] = `${pluralize(counts.symCounts[1], 'is', 'are')} asymmetric.`;
headings[2] = `${pluralize(counts.symCounts[2], 'has', 'have')} 2-way symmetry.`;
headings[4] = `${pluralize(counts.symCounts[4], 'has', 'have')} 4-way symmetry.`;
const buf = new Columnize();
buf.indent = 2;
for (let sym of [1, 2, 4]) {
    buf.flushAndReset();
    if (showSym !== 0 && sym > 1) {
        console.log();
    }
    console.log(headings[sym]);
    if (showSym !== 0) {
        for (let m of maze.allMazes(true)) {
            if (!m.isCanonical || m.symmetry !== sym) {
                continue;
            }
            if (m.symmetry < showSym) {
                continue;
            }
            if (useBoxes) {
                buf.log(m.toUnicode());
            }
            else {
                buf.log(m.toString());
            }
        }
    }
}
buf.flush();
console.log(`\nOne in ${(candidates / counts.total).toFixed(1)} of the wall placements are valid mazes.`);
console.log(`---\nElapsed time: ${elapsedSeconds.toFixed(1)}s`);
console.log(`${Math.floor(counts.total / elapsedSeconds).toLocaleString()} mazes per second.`);
function hrSeconds(hrtime) {
    return hrtime[0] + hrtime[1] / 1e9;
}
function help(err) {
    if (err) {
        console.error(err);
        console.log('');
    }
    console.log("Usage: count-mazes.js [--sym] <rows> [<cols>]");
    console.log(" --show: Print all unique mazes.");
    console.log(" --show=2: Print all 2-way symmetrical mazes.");
    console.log(" --show=4: Print all 4-way symmetrical mazes.");
    console.log(" --boxes: Use Unicode box characters to draw mazes.");
    console.log(" <rows>: Number of rows in the maze");
    console.log(" <cols>: Number of columns in the maze (same as rows if not given)");
    process.exit(1);
}
//# sourceMappingURL=count-mazes.js.map