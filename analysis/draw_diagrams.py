#!/usr/bin/env python3
"""Draw the diagrams for CALCULATION.md as SVG files in images/.

They redraw the ASCII diagrams in Andrew Howroyd's PARI program for A349718
(https://oeis.org/A349718/a349718.txt) and the 28 unique 3 x 3 mazes from the
entry's example.  The graphs are computed, not hand-drawn: the quotient graphs
are checked against the fixed counts in symmetric_mazes.py.

Usage (from the repository root):
    python3 analysis/draw_diagrams.py
"""

import os
from itertools import combinations, product

from symmetric_mazes import fixed_counts, grid_edges, spanning_trees

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'images')

S = 44            # Distance between neighbouring cells.
INK = '#24292f'
MUTED = '#57606a'
FAINT = '#d8dee4'
ACCENT = '#cf222e'
ACCENT_TINT = '#ffebe9'
TINTS = ['#ffebe9', '#ddf4ff', '#dafbe1', '#fbefff']
FONT = 'font-family="-apple-system, Segoe UI, Helvetica, Arial, sans-serif"'


class Svg:
    def __init__(self):
        self.items = []

    def add(self, item):
        self.items.append(item)

    def line(self, x1, y1, x2, y2, color=INK, width=4, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        self.add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
                 f'stroke="{color}" stroke-width="{width}" stroke-linecap="round"{d}/>')

    def path(self, d, color=ACCENT, width=4, dash=None):
        da = f' stroke-dasharray="{dash}"' if dash else ''
        self.add(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}" '
                 f'stroke-linecap="round" stroke-linejoin="round"{da}/>')

    def dot(self, x, y, color=INK, r=6):
        self.add(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{color}"/>')

    def ring(self, x, y, color=INK, r=9):
        self.add(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="none" '
                 f'stroke="{color}" stroke-width="2"/>')

    def rect(self, x, y, w, h, fill, rx=4, stroke=None):
        s = f' stroke="{stroke}" stroke-width="2"' if stroke else ''
        self.add(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
                 f'rx="{rx}" fill="{fill}"{s}/>')

    def text(self, x, y, s, size=13, color=MUTED, anchor='middle', weight='normal'):
        self.add(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{color}" '
                 f'text-anchor="{anchor}" font-weight="{weight}" {FONT}>{s}</text>')

    def arrow(self, x, y, length=36):
        self.line(x, y, x + length - 6, y, MUTED, 2.5)
        self.add(f'<path d="M{x + length - 10:.1f},{y - 6:.1f} L{x + length:.1f},{y:.1f} '
                 f'L{x + length - 10:.1f},{y + 6:.1f}" fill="none" stroke="{MUTED}" '
                 f'stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>')

    def save(self, name, width, height):
        body = '\n'.join(self.items)
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:.0f}" '
               f'height="{height:.0f}" viewBox="0 0 {width:.0f} {height:.0f}">\n'
               f'<rect width="100%" height="100%" rx="8" fill="#ffffff"/>\n'
               f'{body}\n</svg>\n')
        with open(os.path.join(OUT, name), 'w') as f:
            f.write(svg)
        print('wrote', os.path.join('images', name))


def at(x0, y0, cell):
    r, c = cell
    return x0 + c * S, y0 + r * S


def draw_graph(svg, x0, y0, rows, cols, edges, colors=None, lattice=True, cells=None):
    """Grid cells as dots and passages as lines, with faint absent passages."""
    cells = cells or [(r, c) for r in range(rows) for c in range(cols)]
    cellset = set(cells)
    if lattice:
        for u, v in grid_edges(rows, cols):
            if u in cellset and v in cellset:
                svg.line(*at(x0, y0, u), *at(x0, y0, v), FAINT, 2)
    for e in edges:
        color = (colors or {}).get(frozenset(e), INK)
        svg.line(*at(x0, y0, e[0]), *at(x0, y0, e[1]), color)
    for cell in cells:
        svg.dot(*at(x0, y0, cell))


def draw_maze(svg, x0, y0, rows, cols, passages, cell=S, width=4, color=INK):
    """Draw walls (the complement of the passages) with a border."""
    open_ = {frozenset(e) for e in passages}
    svg.add(f'<rect x="{x0:.1f}" y="{y0:.1f}" width="{cols * cell:.1f}" '
            f'height="{rows * cell:.1f}" fill="none" stroke="{color}" '
            f'stroke-width="{width}" stroke-linejoin="square"/>')
    for r, c in product(range(rows), range(cols)):
        if c + 1 < cols and frozenset([(r, c), (r, c + 1)]) not in open_:
            x = x0 + (c + 1) * cell
            svg.line(x, y0 + r * cell, x, y0 + (r + 1) * cell, color, width)
        if r + 1 < rows and frozenset([(r, c), (r + 1, c)]) not in open_:
            y = y0 + (r + 1) * cell
            svg.line(x0 + c * cell, y, x0 + (c + 1) * cell, y, color, width)


def mirror_v(edges, n):
    return [((r1, n - 1 - c1), (r2, n - 1 - c2)) for (r1, c1), (r2, c2) in edges]


# ---------------------------------------------------------------------------

def even_mirror():
    """n = 4: a maze on the 4 x 2 half, mirrored and joined by one passage."""
    n = 4
    half = [((0, 0), (0, 1)), ((0, 0), (1, 0)), ((1, 0), (1, 1)), ((1, 0), (2, 0)),
            ((2, 0), (2, 1)), ((2, 1), (3, 1)), ((3, 0), (3, 1))]
    cross = ((1, 1), (1, 2))
    both = half + mirror_v(half, n)
    maze = both + [cross]
    assert spanning_trees(maze) == 1 and len(maze) == n * n - 1

    svg = Svg()
    top, pad = 56, 36
    x = pad + 40
    svg.text(x + S / 2, 30, 'A maze on the half', weight='bold', color=INK)
    draw_graph(svg, x, top, n, 2, half)
    x += S + 50
    svg.arrow(x, top + 1.5 * S)
    x += 60

    svg.text(x + 1.5 * S, 30, 'Its mirror image', weight='bold', color=INK)
    svg.line(x + 1.5 * S, top - 18, x + 1.5 * S, top + 3 * S + 18, MUTED, 1.5, '5 5')
    draw_graph(svg, x, top, n, n, both)
    for r in range(n):
        svg.line(*at(x, top, (r, 1)), *at(x, top, (r, 2)), ACCENT, 2, '3 6')
    x += 3 * S + 34
    svg.arrow(x, top + 1.5 * S)
    x += 60

    svg.text(x + 1.5 * S, 30, 'Join with 1 of the 4 crossings', weight='bold', color=INK)
    draw_graph(svg, x, top, n, n, maze, {frozenset(cross): ACCENT})
    x += 3 * S + 34
    svg.arrow(x, top + 1.5 * S)
    x += 60

    cell = 34
    my = top + 1.5 * S - n * cell / 2
    svg.text(x + n * cell / 2, 30, 'The maze', weight='bold', color=INK)
    draw_maze(svg, x, my, n, n, maze, cell)
    x += n * cell + pad

    svg.text(x / 2, top + 3 * S + 46,
             'n = 4: each middle mirror fixes n · τ(n, n/2) = 4 · 56 = 224 mazes')
    svg.save('calc-even-mirror.svg', x, top + 3 * S + 66)


def odd_mirror():
    """n = 3: the corridor bijection of GridRefAdj."""
    n = 3
    left = [((0, 0), (0, 1)), ((0, 0), (1, 0)), ((2, 0), (2, 1))]
    corridor = [((0, 1), (1, 1)), ((1, 1), (2, 1))]
    maze = left + corridor + mirror_v(left, n)
    assert spanning_trees(maze) == 1 and len(maze) == n * n - 1
    accent = {frozenset(e): ACCENT for e in corridor}

    svg = Svg()
    top, pad = 56, 40
    x = pad
    svg.text(x + S / 2, 30, 'GridRefAdj tree', weight='bold', color=INK)
    bar_x = x + S
    svg.rect(bar_x - 9, top - 9, 18, 2 * S + 18, ACCENT_TINT, 9, ACCENT)
    svg.line(*at(x, top, (0, 0)), *at(x, top, (1, 0)))
    for r in (0, 2):
        cx, cy = at(x, top, (r, 0))
        svg.line(cx, cy, bar_x - 9, cy)
    for r in range(n):
        svg.dot(*at(x, top, (r, 0)))
    svg.text(bar_x, top + 2 * S + 34, 'corridor', size=12, color=ACCENT)
    svg.text(bar_x, top + 2 * S + 49, '(one vertex)', size=12, color=ACCENT)
    x += S + 50
    svg.arrow(x, top + S)
    x += 60

    svg.text(x + S / 2, 30, 'Open the corridor', weight='bold', color=INK)
    draw_graph(svg, x, top, n, 2, left + corridor, accent)
    x += S + 50
    svg.arrow(x, top + S)
    x += 60

    svg.text(x + S, 30, 'Mirror it', weight='bold', color=INK)
    svg.line(x + S, top - 18, x + S, top + 2 * S + 18, MUTED, 1.5, '5 5')
    draw_graph(svg, x, top, n, n, maze, accent)
    x += 2 * S + 40
    svg.arrow(x, top + S)
    x += 60

    cell = 36
    my = top + S - n * cell / 2
    svg.text(x + n * cell / 2, 30, 'The maze', weight='bold', color=INK)
    draw_maze(svg, x, my, n, n, maze, cell)
    x += n * cell + pad

    svg.text(x / 2, top + 2 * S + 78,
             'Spanning trees of GridRefAdj ↔ mazes fixed by the middle mirror (a = 8 for n = 3)')
    svg.save('calc-odd-mirror.svg', x, top + 2 * S + 98)


def rotate(cell, n, turns):
    for _ in range(turns):
        cell = (cell[1], n - 1 - cell[0])
    return cell


def quotient(n, domain, turns, order, skip_center=False):
    """Quotient graph edges (one per orbit of passages) on the domain cells."""
    rep = {rotate(d, n, turns * i): d for d in domain for i in range(order)}
    center = (n // 2, n // 2)
    seen, edges = set(), []
    for u, v in grid_edges(n, n):
        if skip_center and center in (u, v):
            continue
        images = [(rotate(u, n, turns * i), rotate(v, n, turns * i)) for i in range(order)]
        key = min(tuple(sorted(e)) for e in images)
        if key in seen:
            continue
        seen.add(key)
        # A passage of this orbit leaving from a domain cell.
        inside = [e for e in images if e[0] in domain and e[1] in domain]
        leaving = [e if e[0] in domain else e[::-1] for e in images
                   if (e[0] in domain) != (e[1] in domain)]
        edges.append((rep[u], rep[v], inside[0] if inside else leaving[0], bool(inside)))
    return edges


def half_turn():
    """n = 5: the half-turn quotient graph of GridR2Adj."""
    n = 5
    domain = [(r, c) for r in range(2) for c in range(n)] + [(2, 0), (2, 1), (2, 2)]
    edges = quotient(n, domain, 2, 2)
    assert spanning_trees([e[:2] for e in edges]) == fixed_counts(n)[1]
    glued = [e for e in edges if not e[3]]
    assert sorted((e[2][0], e[2][1], e[1]) for e in glued) == [
        ((1, 3), (2, 3), (2, 1)), ((1, 4), (2, 4), (2, 0))]
    labels = {(2, 3): 'b', (2, 1): 'b', (2, 4): 'a', (2, 0): 'a'}

    svg = Svg()
    top, pad = 56, 40
    x = pad
    svg.text(x + 2 * S, 30, 'Half of the grid', weight='bold', color=INK)
    for r, c in product(range(n), range(n)):
        cx, cy = at(x, top, (r, c))
        svg.rect(cx - S / 2 + 2, cy - S / 2 + 2, S - 4, S - 4,
                 ACCENT_TINT if (r, c) in domain else '#f6f8fa')
    draw_graph(svg, x, top, n, n, [], cells=[])
    for r, c in product(range(n), range(n)):
        cx, cy = at(x, top, (r, c))
        if (r, c) in labels:
            svg.text(cx + 11, cy - 9, labels[(r, c)], size=12, color=ACCENT, weight='bold')
        svg.dot(cx, cy, INK if (r, c) in domain else '#afb8c1')
    for e in glued:
        svg.line(*at(x, top, e[2][0]), *at(x, top, e[2][1]), ACCENT)
    svg.ring(*at(x, top, (2, 2)), INK, 11)
    svg.text(x + 2 * S, top + 4 * S + 40, 'a half turn about the center maps', size=12)
    svg.text(x + 2 * S, top + 4 * S + 56, 'cell a to a and b to b', size=12)
    x += 4 * S + 50
    svg.arrow(x, top + 2 * S)
    x += 64

    svg.text(x + 2 * S, 30, 'Quotient graph (GridR2Adj)', weight='bold', color=INK)
    inner = [e[:2] for e in edges if e[3]]
    draw_graph(svg, x, top, n, n, inner, lattice=False, cells=domain)
    # Glued passages run down from row 1 and around into the middle row.
    for (u, v, _, _), depth, label, dy in zip(sorted(glued, key=lambda e: e[1]),
                                              (0.95, 0.6), ('a', 'b'), (17, -7)):
        ux, uy = at(x, top, u)
        vx, vy = at(x, top, v)
        y = vy + depth * S
        svg.path(f'M{ux:.1f},{uy:.1f} L{ux:.1f},{y - 10:.1f} Q{ux:.1f},{y:.1f} {ux - 10:.1f},{y:.1f} '
                 f'L{vx + 10:.1f},{y:.1f} Q{vx:.1f},{y:.1f} {vx:.1f},{y - 10:.1f} L{vx:.1f},{vy:.1f}')
        svg.text(ux - 0.5 * S, y + dy, label, size=12, color=ACCENT, weight='bold')
    for cell in domain:
        svg.dot(*at(x, top, cell))
    svg.ring(*at(x, top, (2, 2)), INK, 11)
    x += 4 * S + pad

    svg.text(x / 2, top + 4 * S + 84,
             'Its spanning trees ↔ mazes fixed by the half turn (b = 18,000 for n = 5)')
    svg.save('calc-half-turn.svg', x, top + 4 * S + 104)


def quarter_turn():
    """n = 5: the quarter-turn quotient graph of GridR4Adj."""
    n = 5
    domain = [(r, c) for r in range(2) for c in range(3)]
    edges = quotient(n, domain, 1, 4, skip_center=True)
    assert spanning_trees([e[:2] for e in edges]) == fixed_counts(n)[2]
    glued = [e for e in edges if not e[3]]
    assert sorted((e[2][0], e[2][1], e[1]) for e in glued) == [
        ((0, 2), (0, 3), (1, 0)), ((1, 1), (2, 1), (1, 2))]
    labels = {(0, 3): 'a', (1, 0): 'a', (2, 1): 'b', (1, 2): 'b'}

    svg = Svg()
    top, pad = 56, 40
    x = pad
    svg.text(x + 2 * S, 30, 'A quarter of the grid', weight='bold', color=INK)
    for r, c in product(range(n), range(n)):
        cx, cy = at(x, top, (r, c))
        if (r, c) == (2, 2):
            continue
        k = next(i for i in range(4) if rotate((r, c), n, 4 - i) in domain)
        svg.rect(cx - S / 2 + 2, cy - S / 2 + 2, S - 4, S - 4, TINTS[k])
    for r, c in product(range(n), range(n)):
        cx, cy = at(x, top, (r, c))
        if (r, c) in labels:
            svg.text(cx + 11, cy - 9, labels[(r, c)], size=12, color=ACCENT, weight='bold')
        svg.dot(cx, cy, INK if (r, c) in domain else '#afb8c1')
    for e in glued:
        svg.line(*at(x, top, e[2][0]), *at(x, top, e[2][1]), ACCENT)
    svg.ring(*at(x, top, (2, 2)), INK, 11)
    svg.text(x + 2 * S, top + 4 * S + 40, 'quarter turns carry the red block onto', size=12)
    svg.text(x + 2 * S, top + 4 * S + 56, 'the others: cell a to a and b to b', size=12)
    x += 4 * S + 50
    svg.arrow(x, top + 2 * S)
    x += 64

    gx, gy = x + 0.7 * S, top + 0.75 * S
    svg.text(gx + S, 30, 'Quotient graph (GridR4Adj)', weight='bold', color=INK)
    inner = [e[:2] for e in edges if e[3]]
    draw_graph(svg, gx, gy, n, n, inner, lattice=False, cells=domain)
    a = next(e for e in glued if e[1] == (1, 0))
    ux, uy = at(gx, gy, a[0])
    vx, vy = at(gx, gy, a[1])
    y, xl = uy - 0.6 * S, vx - 0.6 * S
    svg.path(f'M{ux:.1f},{uy:.1f} L{ux:.1f},{y + 10:.1f} Q{ux:.1f},{y:.1f} {ux - 10:.1f},{y:.1f} '
             f'L{xl + 10:.1f},{y:.1f} Q{xl:.1f},{y:.1f} {xl:.1f},{y + 10:.1f} '
             f'L{xl:.1f},{vy - 10:.1f} Q{xl:.1f},{vy:.1f} {xl + 10:.1f},{vy:.1f} L{vx:.1f},{vy:.1f}')
    svg.text(xl - 12, (uy + vy) / 2 + 4, 'a', size=12, color=ACCENT, weight='bold')
    # The second passage between the same two cells: a double edge.
    (ux, uy), (vx, vy) = at(gx, gy, (1, 1)), at(gx, gy, (1, 2))
    svg.path(f'M{ux:.1f},{uy:.1f} Q{(ux + vx) / 2:.1f},{uy + 0.75 * S:.1f} {vx:.1f},{vy:.1f}')
    svg.text((ux + vx) / 2 + 4, uy + 0.55 * S + 18, 'b (a double edge)', size=12,
             color=ACCENT, anchor='end')
    # The center hangs off (1, 2) as a leaf, so it is left out.
    cx, cy = at(gx, gy, (2, 2))
    svg.line(vx, vy, cx, cy, '#afb8c1', 3, '2 6')
    svg.dot(cx, cy, '#afb8c1')
    svg.ring(cx, cy, '#afb8c1', 11)
    svg.text(cx + 20, cy + 4, 'center: a leaf,', size=12, anchor='start')
    svg.text(cx + 20, cy + 20, 'left out', size=12, anchor='start')
    for cell in domain:
        svg.dot(*at(gx, gy, cell))
    x = gx + 2 * S + 130

    svg.text(x / 2, top + 4 * S + 84,
             'Its spanning trees ↔ mazes fixed by a quarter turn (c = 60 for n = 5)')
    svg.save('calc-quarter-turn.svg', x, top + 4 * S + 104)


# ---------------------------------------------------------------------------

def unique_3x3():
    """The 28 unique 3 x 3 mazes, grouped by symmetry (the A349718 example)."""
    n = 3
    all_edges = list(grid_edges(n, n))
    # Walls in the order maze-generator.ts uses: each row's vertical walls,
    # then the floors beneath it.
    order = []
    for r in range(n):
        order += [((r, c), (r, c + 1)) for c in range(n - 1)]
        if r < n - 1:
            order += [((r, c), (r + 1, c)) for c in range(n)]

    def transforms(cell):
        r, c = cell
        out = []
        for t in range(4):
            out.append((r, c))
            out.append((r, n - 1 - c))
            r, c = c, n - 1 - r
        return out

    def image(tree, k):
        return frozenset(frozenset(transforms(v)[k] for v in e) for e in tree)

    def walls(tree):
        return tuple(int(frozenset(e) not in tree) for e in order)

    groups = {1: [], 2: [], 4: []}
    for subset in combinations(all_edges, n * n - 1):
        if spanning_trees(list(subset)) != 1:
            continue
        tree = frozenset(frozenset(e) for e in subset)
        images = [image(tree, k) for k in range(8)]
        if walls(tree) != min(walls(t) for t in images):
            continue  # Not the canonical member of its orbit.
        sym = sum(t == tree for t in images)
        kind = ''
        if sym == 2:
            kind = 'half turn' if images[4] == tree else 'mirror'
        elif sym == 4:
            kind = 'pinwheel' if images[2] == tree else 'cross'
        groups[sym].append((walls(tree), tree, kind))
    assert [len(groups[s]) for s in (1, 2, 4)] == [21, 5, 2]

    cell, gap, per_row = 18, 22, 11
    size = n * cell
    svg = Svg()
    x0, y = 30, 34
    width = x0 * 2 + per_row * size + (per_row - 1) * gap
    titles = {1: '21 asymmetric (orbits of 8)', 2: '5 with 2-way symmetry (orbits of 4)',
              4: '2 with 4-way symmetry (orbits of 2)'}
    for sym in (1, 2, 4):
        svg.text(x0, y, titles[sym], weight='bold', color=INK, anchor='start')
        y += 14
        for i, (_, tree, kind) in enumerate(sorted(groups[sym])):
            if i and i % per_row == 0:
                y += size + gap
            mx = x0 + (i % per_row) * (size + gap)
            draw_maze(svg, mx, y, n, n, [tuple(e) for e in tree], cell, 3)
            if kind:
                svg.text(mx + size / 2, y + size + 16, kind, size=11)
        y += size + (40 if sym != 4 else 28) + (8 if sym == 2 else 0)
    svg.save('calc-3x3-mazes.svg', width, y)


if __name__ == '__main__':
    even_mirror()
    odd_mirror()
    half_turn()
    quarter_turn()
    unique_3x3()
