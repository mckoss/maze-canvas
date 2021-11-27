export { pluralize, binomial, Columnize };
function pluralize(n, word, pluralWord) {
    const show = [word, pluralWord || word + 's'][n === 1 ? 0 : 1];
    return `${n.toLocaleString()} ${show}`;
}
// Compute binomial coefficient (n choose k)
// Written by GitHub Copilot
function binomial(n, k) {
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
// Buffer text output across multiple columns of output.
// Accepts output that has more than one line per string (separated by \n).
// Buffer is flushed when reaching the max column width.
class Columnize {
    constructor(fnOut) {
        this.colWidth = 80;
        this.lines = [];
        this.curWidth = 0;
        this.indent = 0;
        this.gap = 1;
        this.flushCount = 0;
        this.fnOut = console.log;
        if (fnOut) {
            this.fnOut = fnOut;
        }
    }
    log(s) {
        const newLines = s.split('\n');
        const maxWidth = newLines.reduce((max, line) => Math.max(max, line.length), 0);
        // Remove trailing empty lines
        while (newLines[newLines.length - 1].length === 0) {
            newLines.pop();
        }
        if (this.curWidth + this.gap + maxWidth > this.colWidth) {
            this.flush();
        }
        // Make sure we have enough ouput lines to accumulate.
        while (this.lines.length < newLines.length) {
            this.lines.push('');
        }
        // Append new lines to output buffer.
        let spacing = this.curWidth === 0 ? this.indent : this.gap;
        for (let i = 0; i < newLines.length; i++) {
            this.lines[i] += ' '.repeat(spacing) + newLines[i];
        }
        this.curWidth += maxWidth + spacing;
        // Fill right all strings to current max width.
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i] += ' '.repeat(this.curWidth - this.lines[i].length);
        }
    }
    flush() {
        if (this.curWidth === 0) {
            return;
        }
        if (this.flushCount++ > 0) {
            this.fnOut('\n'.repeat(this.gap - 1));
        }
        for (let line of this.lines) {
            this.fnOut(line);
        }
        this.lines = [];
        this.curWidth = 0;
    }
    flushAndReset() {
        this.flush();
        this.flushCount = 0;
    }
}
//# sourceMappingURL=util.js.map