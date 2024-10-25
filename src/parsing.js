// parsing.js -- helper functions for parsing moves as text strings.
//
// Strings are of the form: "2a3b4", meaning "move 2 stones from a3 to b4", or
// "e5" meaning "place a new stone on e5".
//
// See formatting.js for the opposite.
//
import {rowColToFieldIndex} from "./util.js";

function parseField(cfg, s) {
  const c = s.charCodeAt(s[0]) - 'a'.charCodeAt(0);
  const r = parseInt(s.slice(1), 10) - 1;
  const i = rowColToFieldIndex(cfg, r, c);
  return i >= 0 ? i : undefined;
}

// Parses a move string into an array [src, cnt, dst], indicating that `cnt`
// stones are moved from `src` to `dst`. (If a new stone is placed on an empty
// field, src === -1 and cnt === 1.)
//
// Moves are formatted in 2 to 5 characters: [<count>] <c1> <r1> [<c2> <r2>],
// where <count> defaults to 1 if omitted, and <c2> and <r2> are equal to
// <r1> and <r2> if omitted.
//
//  c2    -> [ -1,  1,  7 ]
//  3c2e4 -> [  7,  3, 19 ]
//
// If the move cannot be parsed, undefined is returned. This function DOES NOT
// validate the move beyond checking the coordinates are valid.
export function parseMove(cfg, move) {
  if (move === 'pass') return [];
  const m = move.match(/([1-9][0-9]*)?([a-z][1-9][0-9]*)?([a-z][1-9][0-9]*)/);
  if (!m) return undefined;
  const cnt = m[1] != null ? parseInt(m[1], 10) : 1;
  const src = m[2] != null ? parseField(cfg, m[2]) : -1;
  const dst = parseField(cfg, m[3]);
  if (src == null || dst == null) return undefined;
  return [src, cnt, dst];
}
