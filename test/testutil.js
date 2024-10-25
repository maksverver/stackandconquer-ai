import {formatMove} from '../src/formatting.js';
import {parseMove} from '../src/parsing.js';
import {indexOfMove} from '../src/util.js';

export function parseMoves(cfg, movesString) {
  return movesString.split(' ').map(s => {
    const m = parseMove(cfg, s);
    if (m == null) throw new Error(`Could not parse move: "$s"`);
    return m;
  });
}

export function validateMove(state, move) {
  if (indexOfMove(state.generateMoves(), move) < 0) {
    throw new Error(`Invalid move: "${formatMove(move)}"`);
  }
  return move;
}

export function replay(cfg, state, movesString) {
  for (const move of parseMoves(cfg, movesString)) {
    state.doMove(validateMove(state, move));
  }
}
