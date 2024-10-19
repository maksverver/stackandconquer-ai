// Helper functions for parsing moves as text strings of the form:
// "1a2b3", meaning "move 1 stone from a2 to b3".
//
// See formatting.js for the opposite.

import {rowColToFieldIndex} from "./util.js";

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
  if (move.length < 2 || move.length > 5) return undefined;
  var i = 0;
  var cnt = move.length % 2 === 1 ? move.charCodeAt(i++) - '0'.charCodeAt(0) : 1;
  if (!(cnt > 0 && cnt < cfg.winningHeight)) return undefined;
  var src = -1;
  var c1 = move.charCodeAt(i++) - 'a'.charCodeAt(0);
  var r1 = move.charCodeAt(i++) - '1'.charCodeAt(0);
  var dst = rowColToFieldIndex(cfg, r1, c1);
  if (!(dst >= 0)) return undefined;
  if (i < move.length) {
    src = dst;
    var c2 = move.charCodeAt(i++) - 'a'.charCodeAt(0);
    var r2 = move.charCodeAt(i++) - '1'.charCodeAt(0);
    dst = rowColToFieldIndex(cfg, r2, c2);
    if (!(dst >= 0)) return undefined;
  }
  return [src, cnt, dst];
}
