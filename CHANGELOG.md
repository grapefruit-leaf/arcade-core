# Changelog

## [1.0.0] - 2026-10-20

### Added

- `move(board, direction)` slides every tile toward a wall and merges equal neighbours once each.
- `spawn(board, rng?)` adds a 2 or a 4 to a random empty cell; pass your own `rng` for repeatable games.
- `hasMoves(board)` reports whether any direction still changes the board.
- `score(board)` returns the points earned by the move that produced the board.
- `move` and `canMove` throw a `TypeError` for an unknown direction.
- `createBoard`, `canMove`, `hasWon`, `fromValues` and `toValues` helpers.
- TypeScript declarations for `Board`, `Tile`, `Cell`, `Direction` and `Rng`.
