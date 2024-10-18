// Helper functions for parsing moves as text strings of the form:
// "1a2b3", meaning "move 1 stone from a2 to b3".
//
// See formatting.js for the opposite.

import {rowColToFieldIndex} from "./util.js";

// Parses a move string into an array [cnt, src, dst], indicating that `cnt`
// stones are moved from `src` to `dst`. (If a new stone is placed on an empty
// field, src == dst and cnt == 1.)
//
// Moves are formatted in 2 to 5 characters: [<count>] <c1> <r1> [<c2> <r2>],
// where <count> defaults to 1 if omitted, and <c2> and <r2> are equal to
// <r1> and <r2> if omitted.
//
//  c2    -> [1, 7, 7]
//  3c2e4 -> [3, 7, 19]
//
// If the move cannot be parsed, undefined is returned. This function DOES NOT
// validate the move beyond checking the coordinates are valid.
export function parseMove(cfg, move) {
  if (move === 'pass') return [];
  if (move.length < 2 || move.length > 5) return undefined;
  var i = 0;
  var cnt = move.length % 2 === 1 ? move.charCodeAt(i++) - '0'.charCodeAt(0) : 1;
  var c1 = move.charCodeAt(i++) - 'a'.charCodeAt(0);
  var r1 = move.charCodeAt(i++) - '1'.charCodeAt(0);
  var c2 = i < move.length ? move.charCodeAt(i++) - 'a'.charCodeAt(0) : c1;
  var r2 = i < move.length ? move.charCodeAt(i++) - '1'.charCodeAt(0) : r1;
  if (cnt > 0 && cnt < cfg.winningHeight && r1 >= 0 && r1 < cfg.rows && c1 >= 0 && c1 < cfg.cols) {
    var i = rowColToFieldIndex(cfg, r1, c1);
    var j = rowColToFieldIndex(cfg, r2, c2);
    if (i >= 0 && j >= 0) {
      return [cnt, i, j];
    }
  }
}
