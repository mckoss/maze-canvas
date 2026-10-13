# Symmetric Mazes

How many $n \times n$ mazes are *symmetric*, that is, mapped to themselves by
some rotation or reflection of the square?  As in
[A349718](https://oeis.org/A349718), mazes related by a symmetry are counted
once.

The [exhaustive search](../README.md) counts these up to $5 \times 5$.  The
analysis below gives an exact closed form, as a product of trigonometric
terms like the classical formula for [A007341](https://oeis.org/A007341),
and computes the sequence well beyond what enumeration can reach.

The code is [symmetric_mazes.py](symmetric_mazes.py) (standard library only):

```
$ python3 analysis/symmetric_mazes.py 12      # counts for n = 1..12
$ python3 analysis/symmetric_mazes.py --recurrences
```

## Results

| n | Symmetric | 2-way | 4-way |
|---|---|---|---|
| 1 | 1 | 0 | 1* |
| 2 | 1 | 1 | 0 |
| 3 | 7 | 5 | 2 |
| 4 | 112 | 112 | 0 |
| 5 | 7,674 | 7,626 | 48 |
| 6 | 1,140,480 | 1,140,480 | 0 |
| 7 | 1,048,481,660 | 1,048,467,740 | 13,920 |
| 8 | 1,156,572,053,504 | 1,156,572,053,504 | 0 |
| 9 | 17,405,611,202,467,360 | 17,405,611,155,168,464 | 47,298,896 |
| 10 | 120,400,947,062,415,360,000 | 120,400,947,062,415,360,000 | 0 |
| 11 | 33,672,034,945,981,188,227,077,824 | 33,672,034,945,979,370,642,396,192 | 1,817,584,681,632 |
| 12 | 1,303,113,477,212,940,680,191,121,817,600 | 1,303,113,477,212,940,680,191,121,817,600 | 0 |

\* The single cell has all 8 symmetries.

*2-way* mazes are fixed by exactly one non-trivial symmetry; *4-way* mazes by
three (a group of order 4).  No maze larger than $1 \times 1$ has more.

The counts are checked three ways:

1. They match the exhaustive counts for $n \le 5$.
2. Each is computed both as an exact determinant and from the product
   formulas below.
3. Through Burnside's lemma they reproduce every term of A349718 for
   $2 \le n \le 11$: the unique mazes are the asymmetric orbits (8 mazes each)
   plus the symmetric ones (4 mazes per 2-way orbit, 2 per 4-way orbit).

None of the three columns is in the OEIS yet.

## Which symmetries can fix a maze

A maze is a spanning tree of the grid of cells.  Every tree has a *center*: a
single cell, or a single passage between two cells (the middle of its longest
paths).  Any symmetry of the tree maps its center to itself, which rules out
most of the eight symmetries of the square.

**Diagonal mirrors never fix a maze** (for $n > 1$).  No passage joins a cell
to its own mirror image across a diagonal, so the passages of a symmetric maze
come in mirror pairs.  Its half on one side of the diagonal (including the
diagonal cells) must be connected, so it is a spanning tree of that half; the
two halves together then have too many passages to be a tree.

**Even $n$.**  A rotation of an even grid fixes no cell and no passage, so no
maze is rotationally symmetric, and there are no 4-way symmetric mazes.  The
mirror between the two middle columns fixes only the $n$ passages that cross
it.  A maze it fixes has its center on one of those passages: it is a maze of
the $n \times \frac{n}{2}$ half, its mirror image, and exactly one crossing
passage.  (Two crossings would make a loop, since each joins a cell to its own
image.)  The two middle mirrors are related by rotation, so each orbit holds
4 such mazes, and

$$
S(n) = \frac{2 \cdot n \cdot \tau(n, n/2)}{4} = \frac{n}{2}\, \tau\!\left(n, \frac{n}{2}\right)
$$

where $\tau(p, q)$ is the number of mazes on a $p \times q$ grid:

$$
\tau(p, q) = \frac{1}{pq} \prod_{\substack{0 \le j < p,\ 0 \le k < q \\ (j,k) \ne (0,0)}}
\left( 4 \sin^2 \frac{j \pi}{2p} + 4 \sin^2 \frac{k \pi}{2q} \right)
$$

**Odd $n = 2m + 1$.**  Every symmetry fixes the center cell, and four kinds
of symmetry can fix a maze.  Write

$$
\lambda_j = 4 \sin^2 \frac{j \pi}{2n}, \qquad \mu_k = 4 \sin^2 \frac{(2k - 1) \pi}{2n}
$$

for the eigenvalues of a path of $n$ cells with free ends ($\lambda$) and of
a path of $m$ cells whose last cell is joined to a fixed one ($\mu$).

- **Middle mirror** ($a$ mazes each for the vertical and horizontal mirrors).
  The passages along the axis are their own mirror images.  Counting passages
  shows that a fixed maze contains *all* of them: its middle column is one
  straight corridor, and its closed half is a spanning tree containing that
  corridor.  Contracting the corridor to a single cell,

  $$
  a = \prod_{j=0}^{n-1} \prod_{k=1}^{m} (\lambda_j + \mu_k)
  $$

- **Both middle mirrors** ($d$ mazes).  Both middle corridors are open (a
  cross), and the maze is a spanning tree of one closed quadrant containing
  its two half-corridors:

  $$
  d = \prod_{j=1}^{m} \prod_{k=1}^{m} (\mu_j + \mu_k)
  $$

- **Rotation by 180° and 90°** ($b$ and $c$ mazes).  The center cell is the
  only cell or passage a rotation fixes, so a fixed maze is exactly the lift of
  a spanning tree of the *quotient graph*: one vertex per orbit of cells, one
  edge per orbit of passages.  The Laplacian on rotation-invariant patterns has
  eigenvalues $\lambda_j + \lambda_k$ over the products of path eigenvectors
  that the rotation fixes, and the matrix-tree theorem for the weighted
  quotient gives

  $$
  b = \frac{1}{n^2} \prod_{\substack{j + k \text{ even} \\ (j,k) \ne (0,0)}} (\lambda_j + \lambda_k)
  $$

  $$
  c = \frac{1}{n^2} \prod_{\substack{j < k \\ j + k \text{ even}}} (\lambda_j + \lambda_k)
  \prod_{\substack{j \text{ even} \\ j > 0}} 2 \lambda_j
  $$

  with $j, k$ running from $0$ to $n - 1$.

A maze's stabilizer is then one of $\langle r \rangle$ (90° rotation, $c$
mazes), both middle mirrors, $\lbrace e, r^2, V, H \rbrace$ ($d$), $\langle r^2 \rangle$
alone ($b - c - d$), or a single middle mirror ($a - d$ each).  Dividing each
by its orbit size (8 over the stabilizer's order),

$$
S(n) = \frac{2a + b + c - d}{4}, \qquad
\text{4-way} = \frac{c + d}{2}, \qquad
\text{2-way} = S(n) - \frac{c + d}{2}
$$

For $n = 3$: $a = 8$, $b = 12$, $c = 2$, $d = 2$, so $S(3) = 7$, of which 2
are 4-way: one pinwheel ($c$) and one cross ($d$).

## Is there a recurrence?

For a grid of fixed width the counts satisfy a linear recurrence with constant
coefficients (so they have a rational generating function).  Building the maze
one column at a time, as the generator does row by row, only the connectivity
of the current column matters, and there are finitely many such states.

| Grid | Mazes | Recurrence |
|---|---|---|
| $2 \times n$ | 1, 4, 15, 56, 209, ... | $a_n = 4 a_{n-1} - a_{n-2}$ |
| $3 \times n$ | 1, 15, 192, 2415, 30305, ... | $a_n = 15 a_{n-1} - 32 a_{n-2} + 15 a_{n-3} - a_{n-4}$ |
| $4 \times n$ | 1, 56, 2415, 100352, ... | order 7: 56, −672, 2632, −4094, 2632, −672, 56, −1 |

For $n \times n$ mazes there is none: A007341 grows like
$e^{4Gn^2/\pi}$ ($G$ is Catalan's constant), and a sequence satisfying any
linear recurrence, even with polynomial coefficients, grows at most like
$(n!)^r C^n$.  So A007341, A349718 and the symmetric counts have no such
recurrence, and their generating functions are not rational, algebraic or
D-finite.  The products above are as closed as the answer gets.

<script defer>
MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']]
  }
};
</script>

<script id="MathJax-script" defer
  src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js">
</script>
