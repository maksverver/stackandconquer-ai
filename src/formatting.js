// Helper functions for formatting moves as text strings of the form:
// "1a2b3", meaning "move 1 stone from a2 to b3".
//
// See parsing.js for the opposite.

export function formatRow(row) {
  return String(row + 1);
}

export function formatCol(col) {
  return String.fromCharCode('a'.charCodeAt(0) + col);
}

export function formatMove(cfg, move) {
  if (move.length === 0) return 'pass';
  var cols = cfg.cols;
  var c1 = move[1] % cols;
  var r1 = (move[1] - c1) / cols;
  var c2 = move[2] % cols;
  var r2 = (move[2] - c2) / cols;
  var res = '';
  if (move[0] != 1) res += String(move[0]);
  res += formatCol(c1) + formatRow(r1);
  if (r1 != r2 || c1 != c2) res += formatCol(c2) + formatRow(r2);
  return res;
}

export function formatMoves(cfg, moves) {
  var res = '';
  for (var i = 0; i < moves.length; ++i) {
    if (i > 0) res += ' ';
    res += formatMove(cfg, moves[i]);
  }
  return res;
}
