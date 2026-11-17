# Changelog

## [1.1.0] - 2026-11-16

### Added

- Battleship: `createRandomBoard(random?)` places the five ships of `FLEET` on a 10 × 10 board without overlaps.
- `isValidShot(board, x, y)` reports whether a square is on the board and has not been fired at.
- `updateBoard(board, x, y)` returns a new board with the shot recorded as a hit or a miss. Throws a `RangeError` for an invalid shot.
- `isGameComplete(board)` reports whether every ship of the fleet is sunk.
- `shipAt`, `isSunk` and `hideShips` helpers, and the `BOARD_SIZE` and `FLEET` constants.
- TypeScript declarations for `BattleshipBoard`, `Ship`, `ShipName`, `Shot` and `Coordinate`.

## [1.0.0] - 2026-10-20

### Added

- `move(board, direction)` slides every tile toward a wall and merges equal neighbours once each.
- `spawn(board, rng?)` adds a 2 or a 4 to a random empty cell; pass your own `rng` for repeatable games.
- `hasMoves(board)` reports whether any direction still changes the board.
- `score(board)` returns the points earned by the move that produced the board.
- `move` and `canMove` throw a `TypeError` for an unknown direction.
- `createBoard`, `canMove`, `hasWon`, `fromValues` and `toValues` helpers.
- TypeScript declarations for `Board`, `Tile`, `Cell`, `Direction` and `Rng`.
