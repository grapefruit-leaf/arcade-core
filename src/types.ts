export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Tile {
  readonly id: number;
  readonly value: number;
  readonly mergedFrom?: readonly [number, number];
}

export type Cell = Tile | null;
export type Board = readonly (readonly Cell[])[];
export type Rng = () => number;

export type ShipName = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';

export interface Coordinate {
  readonly x: number;
  readonly y: number;
}

export interface Ship {
  readonly name: ShipName;
  readonly cells: readonly Coordinate[];
}

export interface Shot extends Coordinate {
  readonly hit: boolean;
}

export interface BattleshipBoard {
  readonly ships: readonly Ship[];
  readonly shots: readonly Shot[];
}
