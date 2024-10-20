// Wrapper that implements the StackAndConquer CallCPU API.

import {formatMove, formatMoves} from "./formatting.js";
import {createConfig, indexOfMove, log, randomChoice} from "./util.js";
import State from "./State.js";

// Number of pieces per player. This should be configurable, but currently the
// game does not pass this information to the CPU players (issue #11).
export var PIECES_PER_PLAYER = 20;

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

// Reconstructs config and state from jsonBoard and jsonMoves, invokes
// findBestMoves(cfg, state, moves) to list moves, then returns a move selected
// at random.
export function callCpuWrapper(jsonBoard, findBestMoves) {
  var board = JSON.parse(jsonBoard);

  // Possible optimization: cache this between calls to callCPU(), assuming that
  // the game configuration including board layout does not change in between.
  var paddingSize = game.getHeightToWin();
  var cfg = createConfig(
    game.getBoardDimensionY(),
    game.getBoardDimensionX(),
    board,
    game.getOutside(),
    game.getPadding(),
    paddingSize,
    game.getHeightToWin(),
    PIECES_PER_PLAYER,
    game.getNumOfPlayers(),
  );

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

  var state = State(cfg, {
    fields: fields,
    nextPlayer: nextPlayer,
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
