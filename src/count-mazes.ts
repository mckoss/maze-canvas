#!/usr/bin/env node

import { argv, hrtime } from 'process';

import { Maze } from './maze-generator.js';

const size = parseInt(argv[2]);

if (argv.length !== 3 || isNaN(size)) {
  console.error('Usage: count-mazes.js <size>');
  process.exit(1);
}

if (size < 1 || size > 5) {
    console.error(`Size should be between 1 and 5 (not ${size}).`);
    process.exit(1);
}

console.log("Calculating...");
const startTime = hrtime();
const maze = new Maze(size, size);
const count = maze.countMazes();
const elapsedSeconds = hrSeconds(hrtime(startTime));
console.log(`There are ${count.toLocaleString()} mazes of size ${size}x${size}.`);
console.log(`Elapsed time: ${elapsedSeconds.toFixed(2)}s`);
console.log(`${Math.floor(count/elapsedSeconds).toLocaleString()} mazes per second.`);

function hrSeconds(hrtime: [number, number]) {
  return hrtime[0] + hrtime[1] / 1e9;
}
