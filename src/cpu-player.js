// Wrapper that implements the StackAndConquer CallCPU API.

import {formatMove, formatMoves} from "./formatting.js";
import {createConfig, indexOfMove, log, randomChoice} from "./util.js";
import {createStateFromJson} from "./State.js";

function convertMoveFromApi(cfg, apiMove) {
  const {apiToFieldIndex} = cfg;
  if (apiMove == null) return null;
  if (apiMove.length === 0) return apiMove;
  let src = apiMove[0];
  const cnt = apiMove[1];
  let dst = apiMove[2];
  if (src !== -1) src = apiToFieldIndex[src];
  dst = apiToFieldIndex[dst];
  return [src, cnt, dst];
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
  const moves = apiMoves.map(convertMoveFromApi.bind(null, cfg));

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
    lastMove: convertMoveFromApi(game.getLastMove()),
  });

  const result = findBestMoves(cfg, state, moves);
  const bestMoves = result[0];
  const bestValue = result[1];
  const bestMove = randomChoice(bestMoves);
  log(moves.length + ' moves, ' + bestMoves.length + ' best with value ' + bestValue + ': ' +
      formatMoves(cfg, bestMoves) + '; selected ' + formatMove(cfg, bestMove) + ' at random');
  const moveIndex = indexOfMove(moves, bestMove);
  if (moveIndex < 0) throw new Error('Best move not found somehow?!');
  return apiMoves[moveIndex];
}
