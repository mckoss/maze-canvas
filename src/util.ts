export { pluralize };

function pluralize(n: number, word: string, pluralWord?: string): string {
    const show = [word, pluralWord || word + 's'][n === 1 ? 0 : 1];
    return `${n.toLocaleString()} ${show}`;
}