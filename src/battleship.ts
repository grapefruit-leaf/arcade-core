import type { BattleshipBoard, Coordinate, Rng, Ship, ShipName } from './types.js';

export const BOARD_SIZE = 10;

export const FLEET: readonly { readonly name: ShipName; readonly size: number }[] = [
    { name: 'carrier', size: 5 },
    { name: 'battleship', size: 4 },
    { name: 'cruiser', size: 3 },
    { name: 'submarine', size: 3 },
    { name: 'destroyer', size: 2 },
];

function isOnBoard(x: number, y: number): boolean {
    return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE;
}

function isAt(cell: Coordinate, x: number, y: number): boolean {
    return cell.x === x && cell.y === y;
}

export function shipAt(board: BattleshipBoard, x: number, y: number): Ship | undefined {
    return board.ships.find((ship) => ship.cells.some((cell) => isAt(cell, x, y)));
}

export function isSunk(board: BattleshipBoard, ship: Ship): boolean {
    return ship.cells.every((cell) => board.shots.some((shot) => isAt(shot, cell.x, cell.y)));
}

export function hideShips(board: BattleshipBoard): BattleshipBoard {
    return { ships: board.ships.filter((ship) => isSunk(board, ship)), shots: board.shots };
}

export function isValidShot(board: BattleshipBoard, x: number, y: number): boolean {
    return isOnBoard(x, y) && !board.shots.some((shot) => isAt(shot, x, y));
}

export function updateBoard(board: BattleshipBoard, x: number, y: number): BattleshipBoard {
    if (!isValidShot(board, x, y)) throw new RangeError(`Invalid shot: ${x}, ${y}`);
    return { ships: board.ships, shots: [...board.shots, { x, y, hit: shipAt(board, x, y) !== undefined }] };
}

function placements(ships: readonly Ship[], size: number): Coordinate[][] {
    const taken = (x: number, y: number) => ships.some((ship) => ship.cells.some((cell) => isAt(cell, x, y)));
    const options: Coordinate[][] = [];
    for (const horizontal of [true, false]) {
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                const cells = Array.from({ length: size }, (_, i) => (horizontal ? { x: x + i, y } : { x, y: y + i }));
                if (cells.every((cell) => isOnBoard(cell.x, cell.y) && !taken(cell.x, cell.y))) options.push(cells);
            }
        }
    }
    return options;
}

export function createRandomBoard(random: Rng = Math.random): BattleshipBoard {
    const ships: Ship[] = [];
    for (const { name, size } of FLEET) {
        const options = placements(ships, size);
        ships.push({ name, cells: options[Math.floor(random() * options.length)] });
    }
    return { ships, shots: [] };
}

export function isGameComplete(board: BattleshipBoard): boolean {
    return board.ships.length === FLEET.length && board.ships.every((ship) => isSunk(board, ship));
}
