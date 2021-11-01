# Maze Canvas

Draw a maze into an HTML Canvas.

# API

```
drawMaze(maze, canvas, options )
```

<style>
    td {
        vertical-align: top;
    }
</style>

<table>
<tr><th>param</th><th>description</th></tr>

<tr><td>maze</td><td>Text format of a maze, one character per cell.  Each row of the maze is represented by one line of text.  Each character represents the pressence of walls around the cell.

| character | Walls |
| --- | --- |
| ' ' | No walls |
| '_' | Bottom wall |
| '|' | Left wall |
| 'L' | Left and Bottom walls |

*It is assumed that there is a solid wall boundary around the entire drawn maze (so there is no need to represent top and right walls as redundant).*

</td></tr>

<tr><td>options</th><td>
Options are passed in a JSON Object, default values as shown:

```
{
    cellSize: 15,
    margin: 15,
    sizes: {
        cell: 7,
        margin: 10,
        outline: 3,
        wall: 6,
    },
    colors: {
        cell: 'white',
        wall: 'red',
        outline: 'black',
        background: 'red'
    }
}
```

An example 4x4 maze:

![4x4 maze](images/4x4-maze.png)


```
|__
L_|
||_|
L_L_
```

