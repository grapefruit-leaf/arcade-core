import type { Board, Direction, Rng, Tile } from './types.js';

export const WINNING_VALUE = 2048;

const CHANCE_OF_TWO = 0.9;
const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

function mirror(board: Board): Board {
  return board.map((row) => [...row].reverse());
}

function transpose(board: Board): Board {
  return board.map((_, col) => board.map((row) => row[col]));
}

function tilesOf(board: Board): Tile[] {
  return board.flat().filter((cell) => cell !== null);
}

function nextId(board: Board): number {
  return Math.max(0, ...tilesOf(board).map((tile) => tile.id)) + 1;
}

function sameTiles(a: Board, b: Board): boolean {
  return a.every((row, r) => row.every((tile, c) => tile?.id === b[r][c]?.id));
}

function slideLeft(board: Board, firstId: number): Board {
  let id = firstId;
  return board.map((row) => {
    const line: Tile[] = [];
    for (const tile of row) {
      if (!tile) continue;
      const last = line.at(-1);
      // A tile made by a merge in this move can't merge again.
      if (last && !last.mergedFrom && last.value === tile.value) {
        line[line.length - 1] = { id: id++, value: tile.value * 2, mergedFrom: [last.id, tile.id] };
      } else {
        line.push({ id: tile.id, value: tile.value });
      }
    }
    return row.map((_, index) => line[index] ?? null);
  });
}

// Every move is done as a left move: flip or transpose the board, slide left, then undo the flip.
export function move(board: Board, direction: Direction): Board {
  const id = nextId(board);
  switch (direction) {
    case 'left':
      return slideLeft(board, id);
    case 'right':
      return mirror(slideLeft(mirror(board), id));
    case 'up':
      return transpose(slideLeft(transpose(board), id));
    case 'down':
      return transpose(mirror(slideLeft(mirror(transpose(board)), id)));
    default:
      throw new TypeError(`Unknown direction: ${direction}`);
  }
}

export function canMove(board: Board, direction: Direction): boolean {
  return !sameTiles(move(board, direction), board);
}

export function hasMoves(board: Board): boolean {
  return DIRECTIONS.some((direction) => canMove(board, direction));
}

export function spawn(board: Board, rng: Rng = Math.random): Board {
  const empty: [number, number][] = [];
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (!cell) empty.push([r, c]);
    });
  });
  if (empty.length === 0) return board;

  const [row, col] = empty[Math.floor(rng() * empty.length)];
  const tile: Tile = { id: nextId(board), value: rng() < CHANCE_OF_TWO ? 2 : 4 };
  return board.map((cells, r) => (r === row ? cells.map((cell, c) => (c === col ? tile : cell)) : cells));
}

// Note: I implemented this before instruction was updated on 10/26
export function score(board: Board): number {
  return tilesOf(board).reduce((points, tile) => points + (tile.mergedFrom ? tile.value : 0), 0);
}

export function hasWon(board: Board, target = WINNING_VALUE): boolean {
  return tilesOf(board).some((tile) => tile.value >= target);
}
