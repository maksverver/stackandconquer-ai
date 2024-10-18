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

import {arrayOfValues} from "./util.js";
import State from "./State.js";

// Number of Monte Carlo simulations; higher is better, but slower.
var TOTAL_SIMULATIONS        = 4000;
var MIN_SIMULATIONS_PER_MOVE =   10;
var MAX_STEPS_TO_SIMULATE    =  250;  // used to break out of ties/loops

function evaluateWithRandomPlayouts(player, state, simulations) {
  var value = 0.0;
  for (var n = 0; n < simulations; ++n) {
    var newState = state.clone();
    newState.randomPlayout(MAX_STEPS_TO_SIMULATE)
    var winner = newState.getWinner();
    value += winner === player ? 1.0 : winner === -1 ? 0.5 : 0.0;
  }
  return value / simulations;
}

// Finds the best move among the given `moves` by simulating random playouts.
export function findBestMoves(cfg, inputState, moves) {
  var triagedMoves = inputState.triageMoves(moves);
  if (triagedMoves[0].length > 0) {
    // Winning moves available!
    return [triagedMoves[0], 1.0];
  }
  var neutralMoves = triagedMoves[1];
  if (neutralMoves.length === 0) {
    // Only losing moves available.
    return [triagedMoves[2], 0.0];
  }

  // Hack: limit number of towers to win to 1, to increase speed and accuracy.
  var obj = inputState.clone().toJson();
  obj.scoresLeft = arrayOfValues(obj.scoresLeft.length, 1);
  var state = State(cfg, obj);

  var player = state.getNextPlayer();
  var simulationsPerMove = Math.max(MIN_SIMULATIONS_PER_MOVE, Math.floor(TOTAL_SIMULATIONS / neutralMoves.length));
  var bestMoves = [];
  var bestValue = 0.0;
  for (var i = 0; i < neutralMoves.length; ++i) {
    var move = neutralMoves[i];
    var undoState = state.doMove(move);
    var value = evaluateWithRandomPlayouts(player, state, simulationsPerMove);
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
