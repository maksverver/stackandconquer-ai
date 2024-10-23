// Helper functions for formatting moves as text strings of the form:
// "1a2b3", meaning "move 1 stone from a2 to b3".
//
// See parsing.js for the opposite.

import {fieldIndexToRowCol} from "./util.js";

export function formatRow(row) {
  return String(row + 1);
}

export function formatCol(col) {
  return String.fromCharCode('a'.charCodeAt(0) + col);
}

export function formatField(cfg, field) {
  const [row, col] = fieldIndexToRowCol(cfg, field);
  return formatCol(row) + formatRow(col);
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
  let res = '';
  for (let i = 0; i < moves.length; ++i) {
    if (i > 0) res += ' ';
    res += formatMove(cfg, moves[i]);
  }
  return res;
}
