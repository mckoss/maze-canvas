// Web Worker that enumerates mazes off the UI thread.
//
// Request: { rows, cols }
// Replies: { type: 'progress', found } while searching, then
//          { type: 'done', result: MazeSearchResult }.
import { searchMazes } from './maze-search.js';

onmessage = (e: MessageEvent<{ rows: number, cols: number }>) => {
    const { rows, cols } = e.data;
    const result = searchMazes(rows, cols,
        found => postMessage({ type: 'progress', found }));
    postMessage({ type: 'done', result },
        { transfer: [result.walls.buffer, result.symmetries.buffer] });
};
