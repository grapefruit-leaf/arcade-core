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
| `score(board)` | Note: I implemented this before instruction was updated on 10/26. The points earned by the move that produced `board`: the total of every tile created by a merge. |
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

## Battleship

```ts
import { createRandomBoard, hideShips, isGameComplete, isValidShot, updateBoard } from '@honglinwei/arcade-core';

let board = createRandomBoard();

if (isValidShot(board, 3, 7)) {
  board = updateBoard(board, 3, 7);
}

console.log(board.shots.at(-1)); // { x: 3, y: 7, hit: true } or { x: 3, y: 7, hit: false }
console.log(isGameComplete(board) ? 'Fleet sunk' : 'Still afloat');
console.log(hideShips(board)); // what the opponent may see: every shot, and only the sunk ships
```

| Function | Returns |
| --- | --- |
| `createRandomBoard(random = Math.random)` | A board with the five ships of `FLEET` (carrier 5, battleship 4, cruiser 3, submarine 3, destroyer 2) placed horizontally or vertically, never overlapping or leaving the board, and no shots. |
| `isValidShot(board, x, y)` | `true` if `x` and `y` are whole numbers from 0 to 9 and that square hasn't been fired at yet. |
| `updateBoard(board, x, y)` | A new board with the shot added to `shots`, marked as a hit or a miss. Throws a `RangeError` if `isValidShot` is `false`. |
| `isGameComplete(board)` | `true` when every ship of the fleet is sunk. |
| `shipAt(board, x, y)` | The ship covering that square, or `undefined`. |
| `isSunk(board, ship)` | `true` once every square of `ship` has been hit. |
| `hideShips(board)` | The same shots with only the sunk ships, so the board can be shown to the opponent. `isGameComplete` still works on it. |

A board is plain JSON, so it can be stored in a database and sent over the network:

```ts
interface BattleshipBoard {
  ships: { name: ShipName; cells: { x: number; y: number }[] }[];
  shots: { x: number; y: number; hit: boolean }[];
}
```

`x` is the column and `y` is the row, both from 0 to 9. `createRandomBoard` calls `random` once per ship to pick one of the legal placements left, so passing a seeded generator always gives the same board.

## Development

```sh
npm install
npm test
```

The source is split into `src/types.ts` (the types), `src/board.ts` (creating and converting 2048 boards), `src/rules.ts` (the 2048 rules) and `src/battleship.ts` (the Battleship rules), and `src/index.ts` re-exports the public API.

`npm test` compiles `src` to `dist` and runs `test` with Node's built-in test runner (Node 22.18 or later).
