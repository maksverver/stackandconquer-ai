// Minimax algorithm for game tree search.
//
// This implementation uses the Negamax variant with alpha-beta pruning.
//
// This algorithm supports arbitrary board configurations, but only two players.
// See montecarlo.js for an algorithm that is weaker, but does support more than
// two players.
//
// Opportunities for optimization:
//
//  - move ordering by shallow search
//  - instead of calling generateMoves(), generate moves incrementally, to
//    avoid wasting work when a beta-cutoff happens.
//  - add a transposition table?
//

// Determines the strength of the AI: higher is better, but slower.
const SEARCH_DEPTH = 4;

export function evaluateState(state) {
  return state.evaluate();
}

// Returns a pair of [list of best moves, best value].
export function findBestMoves(unusedCfg, state, moves) {

  function search(depthLeft, alpha, beta) {
    if (depthLeft === 0) {
      return state.evaluate();
    }
    const moves = state.generateMoves();
    if (moves.length === 0) {
      // Game is over. Adjust value by `depthLeft` to reward quicker wins.
      let value = state.evaluate();
      if (value > 0) value += depthLeft;
      if (value < 0) value -= depthLeft;
      return value;
    }
    let bestValue = -Infinity;
    for (let i = 0; i < moves.length; ++i) {
      const move = moves[i];
      const undoState = state.doMove(move);
      const value = -search(depthLeft - 1, -beta, -alpha);
      state.undoMove(move, undoState);
      if (value > bestValue) {
        bestValue = value;
        if (value > alpha) alpha = value;
        if (value >= beta) break;
      }
    }
    return bestValue;
  }

  const bestMoves = [];
  let bestValue = -Infinity;
  for (let i = 0; i < moves.length; ++i) {
    const move = moves[i];
    const undoState = state.doMove(move);
    const value = -search(SEARCH_DEPTH - 1, -Infinity, -bestValue + 1);
    state.undoMove(move, undoState);
    if (value > bestValue) {
      bestValue = value;
      bestMoves.length = 0;
    }
    if (value === bestValue) {
      bestMoves.push(move);
    }
  }
  return [bestMoves, bestValue];
}
