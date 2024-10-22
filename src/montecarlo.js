// Player implementation based on Monte Carlo simulations.
//
// This is stronger than the "Advanced" CPU in the StackAndConquer distribution
// but weaker than minimax.js. Compared to minimax.js it has the following
// advantages:
//
//  1. It's weaker, which might be more fun for human players.
//  2. It's more random, which which might be more fun for human players.
//  3. It supports games with more than two players.
//
// Like minimax.js, this also supports arbitrary board configurations.
//
// Possibilities for improvements:
//
//  - detect draws due to a sequence of passes (currently, we just simulate
//    for a maximum number of steps)
//  - guide playouts using heuristics (see AdvancedCPU.js for inspiration)
//  - the current version plays until exactly one tower has been captured,
//    which is not optimal when towers-to-win is greater than 1 (idea: when
//    a winning move is found, keep executing winning moves only until
//    none are left, and then count how many points each player scored?)
//

import {log} from "./util.js";
import {randomPlayout, triageMoves} from "./State.js";

// Number of Monte Carlo simulation steps; higher is better, but slower.
const TOTAL_BUDGET           = 50000;
const MIN_BUDGET_PER_MOVE    =   500;
const MAX_STEPS_TO_SIMULATE  =   250;  // used to break out of ties/loops

function evaluateWithRandomPlayouts(player, initialState, budget) {
  let value = 0.0;
  let errorPrinted = false;
  let simulations = 0;
  while (budget > 0) {
    // Hack: limit number of towers to win to 1, to increase speed and accuracy.
    const state = initialState.clone(1);
    const steps = randomPlayout(state, MAX_STEPS_TO_SIMULATE);
    if (steps >= MAX_STEPS_TO_SIMULATE && !errorPrinted) {
      log('WARNING: maxSteps exceeded!');
      errorPrinted = true;  // only print once
    }
    const winner = state.getWinner();
    value += winner === player ? 1.0 : winner === -1 ? 0.5 : 0.0;
    simulations += 1;
    budget -= steps + 1;
  }
  return value / simulations;
}

export function evaluateState(state) {
  return evaluateWithRandomPlayouts(state.getNextPlayer(), state, TOTAL_BUDGET);
}

// Finds the best move among the given `moves` by simulating random playouts.
export function findBestMoves(unusedCfg, state, moves) {
  const triagedMoves = triageMoves(state, moves);
  if (triagedMoves[0].length > 0) {
    // Winning moves available!
    return [triagedMoves[0], 1.0];
  }
  const neutralMoves = triagedMoves[1];
  if (neutralMoves.length === 0) {
    // Only losing moves available.
    return [triagedMoves[2], 0.0];
  }

  const player = state.getNextPlayer();
  const simulationsPerMove = Math.max(MIN_BUDGET_PER_MOVE, Math.floor(TOTAL_BUDGET / neutralMoves.length));
  const bestMoves = [];
  let bestValue = 0.0;
  for (const move of neutralMoves) {
    const undoState = state.doMove(move);
    const value = evaluateWithRandomPlayouts(player, state, simulationsPerMove);
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
