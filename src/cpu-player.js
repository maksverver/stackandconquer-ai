// Wrapper that implements the StackAndConquer CallCPU API.

import {formatMove, formatMoves} from "./formatting.js";
import {createStateFromJson} from "./gamestate.js";
import {createConfig, indexOfMove, log, randomChoice} from "./util.js";

function convertMoveFromApi(cfg, apiMove) {
  const {apiToFieldIndex} = cfg;
  if (apiMove == null || apiMove.length === 0) return null;
  let [src, cnt, dst] = apiMove;
  if (src !== -1) src = apiToFieldIndex[src];
  dst = apiToFieldIndex[dst];
  return [src, cnt, dst];
}

function movesToCanonicalString(cfg, moves) {
  return moves.map(move => formatMove(cfg, move)).sort().join(',');
}

export function initCpuWrapper(jsonBoard) {
  return createConfig(
    game.getBoardDimensionY(),
    game.getBoardDimensionX(),
    JSON.parse(jsonBoard),
    game.getOutside(),
    game.getPadding(),
    game.getHeightToWin(),  // padding size
    game.getHeightToWin(),
    game.getNumOfPlayers());
}

// Reconstructs config and state from jsonBoard and jsonMoves, invokes
// findBestMoves(cfg, state, moves) to list moves, then returns a move selected
// at random.
export function callCpuWrapper(findBestMoves, cfg, jsonBoard) {
  const board = JSON.parse(jsonBoard);

  const nextPlayer = game.getID() - 1;
  if (!Number.isInteger(nextPlayer) || nextPlayer < 0 || nextPlayer >= cfg.playerCount) {
    throw new Error('Invalid player ID');
  }

  // Convert legal moves from API format to ensure we never make illegal moves.
  const apiMoves = JSON.parse(game.getLegalMoves());
  if (apiMoves.length === 0) throw new Error('No moves available');
  if (apiMoves.length === 1) return apiMoves[0];
  const moves = apiMoves.map(move => convertMoveFromApi(cfg, move));

  const fields = [];
  for (let i = 0; i < cfg.fieldCount; ++i) {
    const field = [];
    const string = board[cfg.fieldIndexToApi[i]];
    for (let j = 0; j < string.length; ++j) {
      const piece = string.charCodeAt(j) - '1'.charCodeAt(0);
      if (piece < 0 || piece >= cfg.playerCount) throw new Error('Invalid piece');
      field.push(piece);
    }
    fields.push(field);
  }
  if (fields.length !== cfg.fieldCount) throw new Error('Invalid number of fields');

  const state = createStateFromJson(cfg, {
    fields,
    nextPlayer,
    piecesLeft: game.getNumberOfStones(),
    scoresLeft: game.getTowersNeededToWin(),
    lastMove: convertMoveFromApi(cfg, game.getLastMove()),
  });

  // For debugging: verify the game's move list matches what I would generate.
  const movesString = movesToCanonicalString(cfg, moves);
  const generatedMovesString = movesToCanonicalString(cfg, state.generateMoves());
  if (movesString !== generatedMovesString) {
    // This currently only happens for the 3-player games. I should sync my
    // implementation once the 3-player rules are fully fleshed out:
    // https://github.com/ElTh0r0/stackandconquer/issues/14
    log('WARNING: API-provided moves differ from generated moves');
    // log('\tConfig:          ' + JSON.stringify(cfg));  // too spammy
    log('State:           ' + JSON.stringify(state.toJson()));
    log('Provided moves:  ' + movesString);
    log('Generated moves: ' + generatedMovesString);
  }

  const [bestMoves, bestValue] = findBestMoves(cfg, state, moves);
  const bestMove = randomChoice(bestMoves);
  log(moves.length + ' moves, ' + bestMoves.length + ' best with value ' + bestValue + ': ' +
      formatMoves(cfg, bestMoves) + '; selected ' + formatMove(cfg, bestMove) + ' at random');
  const moveIndex = indexOfMove(moves, bestMove);
  if (moveIndex < 0) throw new Error('Best move not found somehow?!');
  return apiMoves[moveIndex];
}
