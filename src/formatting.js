// formatting.js -- helper functions for formatting moves as text strings.
//
// Strings are of the form: "2a3b4", meaning "move 2 stones from a3 to b4", or
// "e5" meaning "place a new stone on e5".
//
// See parsing.js for the opposite.
//
import {fieldIndexToRowCol} from "./util.js";

export function formatRow(row) {
  return String(row + 1);
}

export function formatCol(col) {
  return String.fromCharCode('a'.charCodeAt(0) + col);
}

export function formatField(cfg, field) {
  const [row, col] = fieldIndexToRowCol(cfg, field);
  return formatCol(col) + formatRow(row);
}

export function formatMove(cfg, move) {
  if (move.length === 0) return 'pass';
  const [src, cnt, dst] = move;
  let res = '';
  if (cnt !== 1) res += String(cnt);
  if (src !== -1) res += formatField(cfg, src);
  res += formatField(cfg, dst);
  return res;
}

export function formatMoves(cfg, moves) {
  return moves.map(move => formatMove(cfg, move)).join(' ');
}
