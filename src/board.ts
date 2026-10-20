import type { Board, Cell } from './types.js';

export function createBoard(size = 4): Board {
  return Array.from({ length: size }, () => Array<Cell>(size).fill(null));
}

export function fromValues(values: readonly (readonly number[])[]): Board {
  let id = 0;
  return values.map((row) => row.map((value) => (value ? { id: ++id, value } : null)));
}

export function toValues(board: Board): number[][] {
  return board.map((row) => row.map((tile) => tile?.value ?? 0));
}
