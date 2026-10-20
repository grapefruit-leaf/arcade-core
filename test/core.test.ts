import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  canMove,
  createBoard,
  fromValues,
  hasMoves,
  hasWon,
  move,
  score,
  spawn,
  toValues,
  type Board,
  type Direction,
} from '../dist/index.js';

const EMPTY_ROW = [0, 0, 0, 0];

const withFirstRow = (...values: number[]): Board => fromValues([values, EMPTY_ROW, EMPTY_ROW, EMPTY_ROW]);

const firstRowAfter = (board: Board, direction: 'left' | 'right'): number[] => toValues(move(board, direction))[0];

const sequence = (...values: number[]) => () => values.shift() ?? 0;

describe('move', () => {
  test('slides tiles as far as they can go', () => {
    const board = withFirstRow(0, 2, 0, 4);
    assert.deepEqual(firstRowAfter(board, 'left'), [2, 4, 0, 0]);
    assert.deepEqual(firstRowAfter(board, 'right'), [0, 0, 2, 4]);
  });

  test('slides columns up and down', () => {
    const board = fromValues([[2, 0, 0, 0], EMPTY_ROW, [2, 0, 0, 0], [4, 0, 0, 0]]);
    assert.deepEqual(toValues(move(board, 'up')).map((row) => row[0]), [4, 4, 0, 0]);
    assert.deepEqual(toValues(move(board, 'down')).map((row) => row[0]), [0, 0, 4, 4]);
  });

  test('merges each tile at most once per move', () => {
    assert.deepEqual(firstRowAfter(withFirstRow(2, 2, 2, 2), 'left'), [4, 4, 0, 0]);
    assert.deepEqual(firstRowAfter(withFirstRow(4, 4, 8, 0), 'left'), [8, 8, 0, 0]);
    assert.deepEqual(firstRowAfter(withFirstRow(2, 2, 4, 0), 'left'), [4, 4, 0, 0]);
  });

  test('merges the tiles closest to the wall first', () => {
    assert.deepEqual(firstRowAfter(withFirstRow(2, 2, 2, 0), 'left'), [4, 2, 0, 0]);
    assert.deepEqual(firstRowAfter(withFirstRow(2, 2, 2, 0), 'right'), [0, 0, 2, 4]);
  });

  test('keeps the id of a sliding tile and gives merged tiles a new id', () => {
    const board = withFirstRow(0, 0, 0, 2);
    const slid = move(board, 'left');
    assert.equal(slid[0][0]?.id, board[0][3]?.id);

    const merged = move(withFirstRow(2, 2, 0, 0), 'left')[0][0];
    assert.deepEqual(merged?.mergedFrom, [1, 2]);
    assert.equal(merged?.id, 3);
  });

  test('rejects an unknown direction', () => {
    assert.throws(() => move(withFirstRow(2, 0, 0, 0), 'diagonal' as Direction), TypeError);
  });

  test('never mutates the board it is given', () => {
    const board = withFirstRow(2, 2, 4, 4);
    const before = structuredClone(board);
    move(board, 'left');
    spawn(board, sequence(0, 0));
    assert.deepEqual(board, before);
  });
});

describe('board helpers', () => {
  test('createBoard makes an empty square board', () => {
    assert.deepEqual(toValues(createBoard(3)), [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
  });

  test('fromValues and toValues round-trip a grid', () => {
    const grid = [
      [2, 0, 0, 4],
      [0, 8, 0, 0],
      [0, 0, 16, 0],
      [32, 0, 0, 0],
    ];
    assert.deepEqual(toValues(fromValues(grid)), grid);
  });
});

describe('canMove and hasMoves', () => {
  test('a move that changes nothing is not a move', () => {
    const board = withFirstRow(2, 4, 0, 0);
    assert.equal(canMove(board, 'left'), false);
    assert.equal(canMove(board, 'up'), false);
    assert.equal(canMove(board, 'right'), true);
  });

  test('reports when the game is over', () => {
    const stuck = fromValues([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);
    const mergeable = fromValues([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 4],
    ]);
    assert.equal(hasMoves(stuck), false);
    assert.equal(hasMoves(mergeable), true);
    assert.equal(hasMoves(createBoard()), false);
  });
});

describe('spawn', () => {
  test('places a 2 or a 4 in an empty cell chosen by random', () => {
    const board = withFirstRow(2, 0, 0, 0);
    assert.deepEqual(toValues(spawn(board, sequence(0, 0.5)))[0], [2, 2, 0, 0]);
    assert.deepEqual(toValues(spawn(board, sequence(0.99, 0.95))).at(-1), [0, 0, 0, 4]);
  });

  test('gives the new tile an unused id', () => {
    const spawned = spawn(withFirstRow(2, 2, 0, 0), sequence(0, 0));
    assert.deepEqual(spawned[0].map((tile) => tile?.id ?? 0), [1, 2, 3, 0]);
  });

  test('returns a full board unchanged', () => {
    const full = fromValues([EMPTY_ROW, EMPTY_ROW, EMPTY_ROW, EMPTY_ROW].map(() => [2, 4, 2, 4]));
    assert.equal(spawn(full), full);
  });
});

describe('score and hasWon', () => {
  test('score totals every tile created by the last merge', () => {
    assert.equal(score(move(withFirstRow(2, 2, 4, 4), 'left')), 12);
    assert.equal(score(move(withFirstRow(2, 4, 0, 0), 'right')), 0);
  });

  test('score resets on the next move', () => {
    const merged = move(withFirstRow(2, 2, 0, 0), 'left');
    assert.equal(score(move(merged, 'right')), 0);
  });

  test('hasWon is true once a tile reaches 2048', () => {
    assert.equal(hasWon(withFirstRow(1024, 1024, 0, 0)), false);
    assert.equal(hasWon(move(withFirstRow(1024, 1024, 0, 0), 'left')), true);
  });
});
