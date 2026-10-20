# @honglinwei/arcade-core

## Install

```sh
npm install @honglinwei/arcade-core
```

## Usage

```ts
import { canMove, createBoard, hasMoves, move, score, spawn, toValues } from '@honglinwei/arcade-core';

let board = spawn(spawn(createBoard()));
let total = 0;

if (canMove(board, 'left')) {
  board = spawn(move(board, 'left'));
  total += score(board);
}

console.log(toValues(board));
console.log(hasMoves(board) ? 'Keep going' : 'Game over');
```

Merging happens once per tile per move, and the tiles closest to the wall merge first:

```ts
import { fromValues, move, score, toValues } from '@honglinwei/arcade-core';

const next = move(
  fromValues([
    [2, 2, 2, 2],
    [4, 4, 8, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]),
  'left',
);

toValues(next); // [[4, 4, 0, 0], [8, 8, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
score(next); // 16
```

## API

| Function | Returns |
| --- | --- |
| `move(board, direction)` | A new board with every tile slid as far as it can go toward `'up'`, `'down'`, `'left'` or `'right'`. Equal neighbours merge once each. Throws a `TypeError` for an unknown direction. |
| `spawn(board, rng?)` | A new board with a 2 (90%) or a 4 (10%) in a random empty cell. A full board is returned unchanged. |
| `hasMoves(board)` | `true` if any direction would still change the board, `false` when the game is over. |
| `score(board)` | The points earned by the move that produced `board`: the total of every tile created by a merge. |
| `canMove(board, direction)` | `true` if moving in `direction` changes the board. |
| `hasWon(board, target = 2048)` | `true` once any tile reaches `target`. |
| `createBoard(size = 4)` | An empty `size` × `size` board. |
| `fromValues(values)` / `toValues(board)` | Converts between a board and a grid of numbers, where `0` is an empty cell. |

## Boards and tiles

A board is a square array of rows, and each cell is `null` or a tile:

```ts
interface Tile {
  id: number;
  value: number;
  mergedFrom?: [number, number];
}
```

- `id` stays the same while a tile slides and is new when two tiles merge, so a UI can key tiles by id and animate them.
- `mergedFrom` holds the ids of the two tiles merged by the last move. This is how `score(board)` knows what the move earned; the next `move` clears it.

## Repeatable games

`spawn` calls `rng` twice: once to pick the empty cell and once to pick the value. It defaults to `Math.random`. Pass any function that returns numbers in `[0, 1)`, such as a seeded generator, and the same moves always produce the same spawns:

```js
spawn(board, () => 0); // a 2 in the first empty cell, reading left to right, top to bottom
```

## Development

```sh
npm install
npm test
```

The source is split into `src/types.ts` (the types), `src/board.ts` (creating and converting boards) and `src/rules.ts` (the rules), and `src/index.ts` re-exports the public API.

`npm test` compiles `src` to `dist` and runs `test` with Node's built-in test runner (Node 22.18 or later).
