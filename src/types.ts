export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Tile {
  readonly id: number;
  readonly value: number;
  readonly mergedFrom?: readonly [number, number];
}

export type Cell = Tile | null;
export type Board = readonly (readonly Cell[])[];
export type Rng = () => number;
