// Wrapper that implements the StackAndConquer CallCPU API.

import {formatMove, formatMoves} from "./formatting.js";
import {createConfig, indexOfMove, log, randomChoice} from "./util.js";
import State from "./State.js";

// Number of pieces per player. This should be configurable, but currently the
// game does not pass this information to the CPU players (issue #11).
export var PIECES_PER_PLAYER = 20;

// Reconstructs config and state from jsonBoard and jsonMoves, invokes
// findBestMoves(cfg, state, moves) to list moves, then returns a move selected
// at random.
export function callCpuWrapper(jsonBoard, jsonMoves, findBestMoves) {
  var board = JSON.parse(jsonBoard);
  var legalMoves = JSON.parse(jsonMoves);

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

  if (legalMoves.length === 0) throw new Error('No moves available');
  if (legalMoves.length === 1) return legalMoves[0];

  // Convert legal moves from API format. We need to do this because the game
  // won't tell us what the last move was (issue #9), but it is omitted from the
  // legal moves. Also, my AI allows building a tower that gives a point to the
  // opponent while the game does not seem to allow this, so using legalMoves as
  // the source of truth prevents making moves the game considers illegal.
  var moves = [];
  for (var i = 0; i < legalMoves.length; ++i) {
    var apiMove = legalMoves[i];
    var src = apiMove[0];
    var cnt = apiMove[1];
    var dst = apiMove[2];
    if (src !== -1) src = cfg.apiToFieldIndex[src];
    dst = cfg.apiToFieldIndex[dst];
    moves.push([src, cnt, dst]);
  }

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
    lastMove: null,  // issue #9
  });

  var result = findBestMoves(cfg, state, moves);
  var bestMoves = result[0];
  var bestValue = result[1];
  var bestMove = randomChoice(bestMoves);
  log(moves.length + ' moves, ' + bestMoves.length + ' best with value ' + bestValue + ': ' +
      formatMoves(cfg, bestMoves) + '; selected ' + formatMove(cfg, bestMove) + ' at random');
  var moveIndex = indexOfMove(moves, bestMove);
  if (moveIndex < 0) throw new Error('Best move not found somehow?!');
  return legalMoves[moveIndex];
}
