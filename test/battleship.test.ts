import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  BOARD_SIZE,
  FLEET,
  createRandomBoard,
  hideShips,
  isGameComplete,
  isSunk,
  isValidShot,
  shipAt,
  updateBoard,
  type BattleshipBoard,
  type Coordinate,
} from '../dist/index.js';

const board: BattleshipBoard = {
  ships: [
    { name: 'carrier', cells: [0, 1, 2, 3, 4].map((x) => ({ x, y: 0 })) },
    { name: 'battleship', cells: [0, 1, 2, 3].map((y) => ({ x: 9, y: y + 2 })) },
    { name: 'cruiser', cells: [0, 1, 2].map((x) => ({ x, y: 9 })) },
    { name: 'submarine', cells: [4, 5, 6].map((x) => ({ x, y: 5 })) },
    { name: 'destroyer', cells: [0, 1].map((y) => ({ x: 2, y: y + 3 })) },
  ],
  shots: [],
};

const fireAll = (start: BattleshipBoard, cells: readonly Coordinate[]) =>
  cells.reduce((next, { x, y }) => updateBoard(next, x, y), start);

const sequence = (...values: number[]) => () => values.shift() ?? 0;

describe('isValidShot', () => {
  test('accepts any square on the board that has not been fired at', () => {
    assert.equal(isValidShot(board, 0, 0), true);
    assert.equal(isValidShot(board, 9, 9), true);
  });

  test('rejects a repeat shot', () => {
    assert.equal(isValidShot(updateBoard(board, 3, 3), 3, 3), false);
  });

  test('rejects squares off the board and non-integers', () => {
    assert.equal(isValidShot(board, -1, 0), false);
    assert.equal(isValidShot(board, 0, BOARD_SIZE), false);
    assert.equal(isValidShot(board, 1.5, 2), false);
  });
});

describe('updateBoard', () => {
  test('records a hit on a ship and a miss on open water', () => {
    const next = updateBoard(updateBoard(board, 0, 0), 5, 9);
    assert.deepEqual(next.shots, [
      { x: 0, y: 0, hit: true },
      { x: 5, y: 9, hit: false },
    ]);
  });

  test('returns a new board and never mutates the one it is given', () => {
    const before = structuredClone(board);
    const next = updateBoard(board, 0, 0);
    assert.notEqual(next, board);
    assert.deepEqual(board, before);
  });

  test('throws a RangeError for an invalid shot', () => {
    assert.throws(() => updateBoard(updateBoard(board, 1, 1), 1, 1), RangeError);
    assert.throws(() => updateBoard(board, 10, 0), RangeError);
  });
});

describe('createRandomBoard', () => {
  test('places the whole fleet without overlaps or leaving the board', () => {
    for (let i = 0; i < 200; i++) {
      const random = createRandomBoard();
      assert.deepEqual(
        random.ships.map((ship) => [ship.name, ship.cells.length]),
        FLEET.map((ship) => [ship.name, ship.size]),
      );
      const cells = random.ships.flatMap((ship) => ship.cells.map(({ x, y }) => `${x},${y}`));
      assert.equal(new Set(cells).size, cells.length);
      for (const ship of random.ships) {
        const xs = new Set(ship.cells.map((cell) => cell.x));
        const ys = new Set(ship.cells.map((cell) => cell.y));
        assert.ok(xs.size === 1 || ys.size === 1);
        assert.ok(ship.cells.every(({ x, y }) => isValidShot(random, x, y)));
      }
      assert.deepEqual(random.shots, []);
    }
  });

  test('uses random to choose each placement, so the same numbers give the same board', () => {
    assert.deepEqual(createRandomBoard(sequence(0.1, 0.5, 0.9, 0.3, 0.7)), createRandomBoard(sequence(0.1, 0.5, 0.9, 0.3, 0.7)));
    assert.deepEqual(createRandomBoard(() => 0).ships[0].cells, [0, 1, 2, 3, 4].map((x) => ({ x, y: 0 })));
    assert.deepEqual(createRandomBoard(() => 0.999).ships[0].cells, [5, 6, 7, 8, 9].map((y) => ({ x: 9, y })));
  });
});

describe('isGameComplete and sinking', () => {
  test('a ship is sunk once every one of its squares is hit', () => {
    const destroyer = board.ships[4];
    assert.equal(isSunk(updateBoard(board, 2, 3), destroyer), false);
    assert.equal(isSunk(fireAll(board, destroyer.cells), destroyer), true);
    assert.equal(shipAt(board, 2, 4), destroyer);
    assert.equal(shipAt(board, 5, 5)?.name, 'submarine');
    assert.equal(shipAt(board, 8, 8), undefined);
  });

  test('is false while any ship is afloat and true when none are', () => {
    const cells = board.ships.flatMap((ship) => ship.cells);
    assert.equal(isGameComplete(board), false);
    assert.equal(isGameComplete(fireAll(board, cells.slice(1))), false);
    assert.equal(isGameComplete(fireAll(board, cells)), true);
  });

  test('hideShips keeps the shots and only the sunk ships', () => {
    const shot = fireAll(board, [...board.ships[4].cells, { x: 0, y: 0 }, { x: 7, y: 7 }]);
    const hidden = hideShips(shot);
    assert.deepEqual(hidden.ships.map((ship) => ship.name), ['destroyer']);
    assert.deepEqual(hidden.shots, shot.shots);
    assert.equal(isGameComplete(hidden), false);
    const cells = board.ships.flatMap((ship) => ship.cells);
    assert.equal(isGameComplete(hideShips(fireAll(board, cells))), true);
  });
});
