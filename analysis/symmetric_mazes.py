#!/usr/bin/env python3
"""Count the symmetric mazes (spanning trees) of the n x n grid.

A maze is "symmetric" when some rotation or reflection of the square maps it
to itself.  Mazes related by a symmetry are counted once, as in A349718.

The counts are computed two independent ways:

1. Exact integers: the number of mazes fixed by each symmetry is the number of
   spanning trees of a smaller graph (a quotient or contracted graph), found
   with Kirchhoff's matrix-tree theorem and an exact integer determinant.
2. Closed-form trigonometric products (floating point), as a check.

The results are also checked against the exhaustive counts for n <= 5 and,
through Burnside's lemma, against A349718 (all unique mazes).

See symmetric-mazes.md for the derivation.

Usage:
    python3 symmetric_mazes.py [N]           counts for n = 1..N (default 12)
    python3 symmetric_mazes.py --recurrences linear recurrences for k x n mazes

Uses only the Python standard library.
"""

import math
import sys
from fractions import Fraction
from itertools import product


# Exhaustive counts from scripts/count-mazes.js: n -> (symmetric, 2-way, 4-way).
EXHAUSTIVE = {
    2: (1, 1, 0),
    3: (7, 5, 2),
    4: (112, 112, 0),
    5: (7674, 7626, 48),
}

# A349718: mazes on the n x n grid up to rotation and reflection.
A349718 = [
    1, 1, 28, 12600, 69699849, 4070693024640, 2484046163254367574,
    15778915364062895746351104, 1040828457711477326843036225608036,
    711789875509887224494712166194197254144000,
    5040627715175514814159607456023227379139001458908168,
]


# ---------------------------------------------------------------------------
# Exact counts from the matrix-tree theorem.

def det(matrix):
    """Determinant of an integer matrix (Bareiss fraction-free elimination)."""
    m = [row[:] for row in matrix]
    n = len(m)
    if n == 0:
        return 1
    sign, prev = 1, 1
    for k in range(n - 1):
        if m[k][k] == 0:
            for i in range(k + 1, n):
                if m[i][k] != 0:
                    m[k], m[i] = m[i], m[k]
                    sign = -sign
                    break
            else:
                return 0
        for i in range(k + 1, n):
            for j in range(k + 1, n):
                m[i][j] = (m[i][j] * m[k][k] - m[i][k] * m[k][j]) // prev
        prev = m[k][k]
    return sign * m[n - 1][n - 1]


def grid_edges(rows, cols):
    """Edges between orthogonally adjacent cells of a rows x cols grid."""
    for r, c in product(range(rows), range(cols)):
        if c + 1 < cols:
            yield (r, c), (r, c + 1)
        if r + 1 < rows:
            yield (r, c), (r + 1, c)


def spanning_trees(edges, label=lambda v: v):
    """Spanning trees of the multigraph on vertices label(v).

    label() merges vertices (to contract a set of cells, or to form a
    quotient graph); edges that become loops are dropped.
    """
    verts = sorted({label(v) for e in edges for v in e})
    index = {v: i for i, v in enumerate(verts)}
    n = len(verts)
    lap = [[0] * n for _ in range(n)]
    for u, v in edges:
        a, b = index[label(u)], index[label(v)]
        if a == b:
            continue
        lap[a][a] += 1
        lap[b][b] += 1
        lap[a][b] -= 1
        lap[b][a] -= 1
    return det([row[1:] for row in lap[1:]])


def grid_trees(rows, cols):
    """Mazes on a rows x cols grid (A007341 when rows == cols)."""
    return spanning_trees(list(grid_edges(rows, cols)))


AXIS = (-1, -1)  # Label for a contracted set of cells.


def fixed_counts(n):
    """Mazes fixed by each symmetry of the n x n grid, for odd n = 2m + 1.

    a: the mirror through the middle column (or row),
    b: rotation by 180 degrees,
    c: rotation by 90 degrees,
    d: both middle mirrors.
    No maze (n > 1) is fixed by a diagonal mirror.
    """
    m = n // 2
    edges = list(grid_edges(n, n))

    # A maze fixed by the middle-column mirror contains the whole middle
    # column, and its left half (with that column) is a spanning tree.
    # So a = spanning trees of the closed half with the axis contracted.
    a = spanning_trees(list(grid_edges(n, m + 1)),
                       lambda v: AXIS if v[1] == m else v)

    # Fixed by both mirrors: spanning trees of the closed quadrant that
    # contain both half-axes.
    d = spanning_trees(list(grid_edges(m + 1, m + 1)),
                       lambda v: AXIS if v[0] == m or v[1] == m else v)

    # A maze fixed by a rotation is the lift of a spanning tree of the
    # quotient graph (one vertex per orbit of cells, one edge per orbit of
    # passages), since the center cell is the rotation's only fixed point.
    def rotate(v, turns):
        for _ in range(turns):
            v = (v[1], n - 1 - v[0])
        return v

    def quotient_trees(turns, order):
        def orbit(v):
            return min(rotate(v, turns * i) for i in range(order))

        edge_orbits = {min(tuple(sorted((rotate(u, turns * i), rotate(v, turns * i))))
                           for i in range(order))
                       for u, v in edges}
        return spanning_trees(list(edge_orbits), orbit)

    b = quotient_trees(2, 2)
    c = quotient_trees(1, 4)
    return a, b, c, d


def symmetric_counts(n):
    """(symmetric, 2-way, 4-way) unique symmetric mazes of size n x n."""
    if n == 1:
        return 1, 0, 1  # A single cell has all 8 symmetries.
    if n % 2 == 0:
        # Only the mirror lines between the middle columns (or rows) can fix
        # a maze: it is a maze of one n x n/2 half plus one of the n
        # passages across the middle.  The two mirrors give 2 n tau(n, n/2)
        # mazes in orbits of 4.
        s = n // 2 * grid_trees(n, n // 2)
        return s, s, 0
    a, b, c, d = fixed_counts(n)
    # Count orbits by stabilizer (Moebius inversion over subgroups of D4).
    total, four = 2 * a + b + c - d, c + d
    assert total % 4 == 0 and four % 2 == 0
    total, four = total // 4, four // 2
    return total, total - four, four


# ---------------------------------------------------------------------------
# Closed-form products (floating point).

def lam(j, n):
    return 4 * math.sin(j * math.pi / (2 * n)) ** 2


def mu(k, n):
    return 4 * math.sin((2 * k - 1) * math.pi / (2 * n)) ** 2


def fprod(values):
    result = 1.0
    for v in values:
        result *= v
    return result


def grid_trees_formula(p, q):
    return fprod(lam(j, p) + lam(k, q)
                 for j in range(p) for k in range(q) if (j, k) != (0, 0)) / (p * q)


def symmetric_counts_formula(n):
    if n == 1:
        return 1, 0, 1
    if n % 2 == 0:
        s = n / 2 * grid_trees_formula(n, n // 2)
        return s, s, 0
    m = n // 2
    a = fprod(lam(j, n) + mu(k, n) for j in range(n) for k in range(1, m + 1))
    b = fprod(lam(j, n) + lam(k, n) for j in range(n) for k in range(n)
              if (j + k) % 2 == 0 and (j, k) != (0, 0)) / n ** 2
    c = (fprod(lam(j, n) + lam(k, n) for j in range(n) for k in range(j + 1, n)
               if (j + k) % 2 == 0)
         * fprod(2 * lam(j, n) for j in range(2, n, 2)) / n ** 2)
    d = fprod(mu(j, n) + mu(k, n) for j in range(1, m + 1) for k in range(1, m + 1))
    total = (2 * a + b + c - d) / 4
    return total, total - (c + d) / 2, (c + d) / 2


# ---------------------------------------------------------------------------
# Linear recurrences for fixed-width grids.

def berlekamp_massey(seq):
    """Shortest linear recurrence s[n] = sum(c[i] * s[n - 1 - i])."""
    s = [Fraction(x) for x in seq]
    conn, prev_conn = [Fraction(1)], [Fraction(1)]
    length, shift, prev_d = 0, 1, Fraction(1)
    for n in range(len(s)):
        d = s[n] + sum(conn[i] * s[n - i] for i in range(1, length + 1))
        if d == 0:
            shift += 1
            continue
        old = conn[:]
        conn += [Fraction(0)] * (len(prev_conn) + shift - len(conn))
        for i, coef in enumerate(prev_conn):
            conn[i + shift] -= d / prev_d * coef
        if 2 * length <= n:
            length, prev_conn, prev_d, shift = n + 1 - length, old, d, 1
        else:
            shift += 1
    return [-c for c in conn[1:length + 1]]


def show_recurrences(max_rows=4, terms=22):
    for rows in range(2, max_rows + 1):
        seq = [grid_trees(rows, n) for n in range(1, terms)]
        coeffs = [int(c) for c in berlekamp_massey(seq)]
        print(f"{rows} x n: {', '.join(map(str, seq[:6]))}, ...")
        print(f"  a(n) = {coeffs} . (a(n-1), a(n-2), ...)")
    seq = [grid_trees(n, n) for n in range(1, 13)]
    print(f"n x n: no recurrence shorter than {len(berlekamp_massey(seq))} "
          f"(the most 12 terms can show)")


# ---------------------------------------------------------------------------

def main():
    if "--recurrences" in sys.argv:
        show_recurrences()
        return
    max_n = int(sys.argv[1]) if len(sys.argv) > 1 else 12

    print("| n | Symmetric | 2-way | 4-way |")
    print("|---|---|---|---|")
    for n in range(1, max_n + 1):
        exact = symmetric_counts(n)

        formula = symmetric_counts_formula(n)
        assert all(math.isclose(x, y, rel_tol=1e-9) for x, y in zip(exact, formula)), \
            f"n={n}: product formula {formula} != exact {exact}"
        if n in EXHAUSTIVE:
            assert exact == EXHAUSTIVE[n], f"n={n}: {exact} != exhaustive {EXHAUSTIVE[n]}"
        if 2 <= n <= len(A349718):
            # Burnside: unique = asymmetric orbits (of 8 mazes) + symmetric
            # orbits; 2-way orbits hold 4 mazes and 4-way orbits 2.
            total, two, four = exact
            asymmetric = grid_trees(n, n) - (4 * two + 2 * four)
            assert asymmetric % 8 == 0 and asymmetric // 8 + total == A349718[n - 1], \
                f"n={n}: does not match A349718"

        print("| " + " | ".join(f"{x:,}" for x in (n,) + exact) + " |")


if __name__ == "__main__":
    main()
