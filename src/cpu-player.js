// Wrapper that implements the StackAndConquer CallCPU API.

import {formatMove, formatMoves} from "./formatting.js";
import {createConfig, indexOfMove, log, randomChoice} from "./util.js";
import {createStateFromJson} from "./State.js";

function convertMoveFromApi(cfg, apiMove) {
  if (apiMove == null) return null;
  if (apiMove.length === 0) return apiMove;
  var src = apiMove[0];
  var cnt = apiMove[1];
  var dst = apiMove[2];
  if (src !== -1) src = cfg.apiToFieldIndex[src];
  dst = cfg.apiToFieldIndex[dst];
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
    game.getNumOfPlayers(),
  );
}

// Reconstructs config and state from jsonBoard and jsonMoves, invokes
// findBestMoves(cfg, state, moves) to list moves, then returns a move selected
// at random.
export function callCpuWrapper(findBestMoves, cfg, jsonBoard) {
  var board = JSON.parse(jsonBoard);

  var nextPlayer = game.getID() - 1;
  if (!Number.isInteger(nextPlayer) || nextPlayer < 0 || nextPlayer >= cfg.playerCount) {
    throw new Error('Invalid player ID');
  }

  // Convert legal moves from API format to ensure we never make illegal moves.
  var apiMoves = JSON.parse(game.getLegalMoves());
  if (apiMoves.length === 0) throw new Error('No moves available');
  if (apiMoves.length === 1) return apiMoves[0];
  var moves = apiMoves.map(convertMoveFromApi.bind(null, cfg));

  var fields = [];
  for (var i = 0; i < cfg.fieldCount; ++i) {
    var field = [];
    var string = board[cfg.fieldIndexToApi[i]];
    for (var j = 0; j < string.length; ++j) {
      var piece = string.charCodeAt(j) - '1'.charCodeAt(0);
      if (piece < 0 || piece >= cfg.playerCount) throw new Error('Invalid piece');
      field.push(piece);
    }
    fields.push(field);
  }
  if (fields.length !== cfg.fieldCount) throw new Error('Invalid number of fields');

  var state = createStateFromJson(cfg, {
    fields: fields,
    nextPlayer: nextPlayer,
    piecesLeft: game.getNumberOfStones(),
    scoresLeft: game.getTowersNeededToWin(),
    lastMove: convertMoveFromApi(game.getLastMove()),
  });

  var result = findBestMoves(cfg, state, moves);
  var bestMoves = result[0];
  var bestValue = result[1];
  var bestMove = randomChoice(bestMoves);
  log(moves.length + ' moves, ' + bestMoves.length + ' best with value ' + bestValue + ': ' +
      formatMoves(cfg, bestMoves) + '; selected ' + formatMove(cfg, bestMove) + ' at random');
  var moveIndex = indexOfMove(moves, bestMove);
  if (moveIndex < 0) throw new Error('Best move not found somehow?!');
  return apiMoves[moveIndex];
}
