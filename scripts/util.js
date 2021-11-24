export { pluralize, binomial };
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
//# sourceMappingURL=util.js.map