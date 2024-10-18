import {formatRow, formatCol, formatMove, formatMoves} from "./formatting.js";
import {log, arrayOfValues, arrayOfObjects, randomChoice, rowColToFieldIndex} from "./util.js";

// Move that represents passing (an empty array).
var PASS = Object.freeze([]);

function cloneArray(arr) {
  return arr.slice();
}

function cloneFields(arr) {
  return arr.map(cloneArray);
}

// See State() for a description of these parameters.
function StateImpl(cfg, fields, nextPlayer, lastMove, scoresLeft, occupied, piecesLeft) {

  function getNextPlayer() {
    return nextPlayer;
  }

  // Returns the player index of the winner, or -1 if there is no winner.
  function getWinner() {
    return scoresLeft.indexOf(0);
  }

  function doMoveInternal(move) {
    var removed = null;
    if (move.length !== 0) {
      var cnt = move[0];
      var src = move[1];
      var dst = move[2];
      var srcField = fields[src];
      var dstField = fields[dst];
      if (src === dst) {
        --piecesLeft[nextPlayer];
        dstField.push(nextPlayer);
        occupied ^= 1 << dst;
      } else {
        dstField.push.apply(dstField, srcField.splice(srcField.length - cnt));
        if (srcField.length === 0) {
          occupied ^= 1 << src;
        }
        if (dstField.length >= cfg.winningHeight) {
          removed = dstField.splice(0);
          var winner = removed[removed.length - 1];
          scoresLeft[winner] -= 1;
          occupied ^= 1 << dst;
          for (var i = 0; i < removed.length; ++i) ++piecesLeft[removed[i]];
        }
      }
      ++nextPlayer;
      if (nextPlayer === cfg.playerCount) nextPlayer = 0;
      lastMove = move;
      return removed;
    }
  }

  // Executes a move and returns undo state that can be passed to undoMove() to
  // undo the move.
  //
  // Important: `move` must be valid!
  function doMove(move) {
    return [lastMove, doMoveInternal(move)];
  }

  // Undoes the last move.
  //
  // Important: `move` must be the last move done, and `undoState` must be the
  // unmodified object return by the corresponding call to `doMove()`.
  function undoMove(move, undoState) {
    if (nextPlayer === 0) nextPlayer = cfg.playerCount;
    --nextPlayer;
    lastMove = undoState[0];
    if (move.length !== 0) {
      var cnt = move[0];
      var src = move[1];
      var dst = move[2];
      var srcField = fields[src];
      var dstField = fields[dst];
      if (src === dst) {
        ++piecesLeft[nextPlayer];
        dstField.pop();
        occupied ^= 1 << dst;
      } else {
        var removed = undoState[1];
        if (removed != null) {
          for (var i = 0; i < removed.length; ++i) --piecesLeft[removed[i]];
          var winner = removed[removed.length - 1];
          scoresLeft[winner] += 1;
          dstField.push.apply(dstField, removed);
          occupied ^= 1 << dst;
        }
        if (srcField.length === 0) {
          occupied ^= 1 << src;
        }
        srcField.push.apply(srcField, dstField.splice(dstField.length - cnt));
      }
    }
  }

  // Heuristically evaluates the state with respect to the next player.
  //
  // The current evaluation function is not highly optimized. It can probably
  // be optimized significantly.
  //
  // This is only used by the Minimax player.
  function evaluate() {
    var winner = getWinner();
    if (winner !== -1) return winner === nextPlayer ? 1000000000 : -1000000000;

    var score = 10000 * (scoresLeft[1 - nextPlayer] - scoresLeft[nextPlayer]);
    for (var dst = 0; dst < fields.length; ++dst) {
      var dstField = fields[dst];
      var dstHeight = dstField.length;
      if (dstHeight > 0) {
        var options = cfg.moves[dst][dstHeight];
        for (var i = 0; i < options.length; ++i) {
          var src = options[i][0];
          var srcField = fields[src]
          var srcHeight = srcField.length;
          if (srcHeight + dstHeight >= cfg.winningHeight && (occupied & options[i][1]) === 0) {
            if (srcField[srcHeight - 1] === nextPlayer) {
              // Winning move found!
              score += 1000;
            } else {
              // Winning move for opponent (though I might still be able to prevent it).
              // Possible improvement: check if I have moves to prevent it.
              score -= 100;
            }
          }
        }
        // Reward piece on top of a tower.
        if (dstField[dstHeight - 1] === nextPlayer) {
          score += 10 * dstHeight;
        } else {
          score -= 10 * dstHeight;
        }
        // Reward pieces on the board.
        for (var i = 0; i < dstHeight; ++i) {
          if (dstField[i] === nextPlayer) {
            score += 1 + i;
          } else {
            score -= 1 + i;
          }
        }
      }
    }
    return score;
  }

  // Generates a list of all possible moves.
  //
  // A move is a triple [cnt, src, dst], or an empty array [] to pass.
  // If cnt == 1 and src == dst, a new piece is placed.
  //
  // Rules of the game:
  //  - https://spielstein.com/games/mixtour/rules (2 players)
  //  - https://spielstein.com/games/mixtour/rules/a-trois (3 players)
  function generateMoves() {
    if (getWinner() !== -1) return [];  // Game is over
    var moveTemplates = cfg.moves;
    var moves = [];
    var lastCnt = 0, lastSrc = -1, lastDst = -1;
    if (lastMove != null && lastMove.length != 0) {
      lastCnt = lastMove[0];
      lastSrc = lastMove[1];
      lastDst = lastMove[2];
    }
    for (var dst = 0; dst < fields.length; ++dst) {
      var dstHeight = fields[dst].length;
      if (dstHeight === 0) {
        if (piecesLeft[nextPlayer]) {
          moves.push([1, dst, dst]);  // place new piece
        }
      } else {
        var options = moveTemplates[dst][dstHeight];
        for (var i = 0; i < options.length; ++i) {
          var src = options[i][0];
          var srcHeight = fields[src].length;
          if (srcHeight !== 0 && (occupied & options[i][1]) === 0) {
            for (var cnt = 1; cnt <= srcHeight; ++cnt) {
              // Do not allow undoing the last move.
              if (cnt === lastCnt && src == lastDst && dst == lastSrc) continue;
              moves.push([cnt, src, dst]);  // move pieces
            }
          }
        }
      }
    }
    if (moves.length === 0) moves.push(PASS);
    return moves;
  }

  // Returns the index of the player who wins the tower if this move creates
  // a winning tower, or -1 if it does not.
  function getMoveWinner(move) {
    if (move.length !== 0 && fields[move[2]].length + move[0] >= cfg.winningHeight) {
      var srcField = fields[move[1]];
      return srcField[srcField.length - 1];
    }
    return -1;
  }

  // Classifies the given list of moves into three types: winning, neutral and
  // losing. This is only used by the Monte Carlo player.
  function triageMoves(moves) {
    var winningMoves = [];
    var neutralMoves = [];
    var losingMoves = [];
    for (var i = 0; i < moves.length; ++i) {
      var move = moves[i];
      var winner = getMoveWinner(move);
      if (winner === -1) {
        neutralMoves.push(move);
      } else if (winner === nextPlayer) {
        winningMoves.push(move);
      } else {
        losingMoves.push(move);
      }
    }
    return [winningMoves, neutralMoves, losingMoves];
  }

  // Plays a mostly-random move, using the following heuristic: play a winning
  // move if it exists, don't play an immediately losing move if it can be
  // avoided, and otherwise play randomly.
  //
  // This is only used by the Monte Carlo player.
  function playRandomMove() {
    var triagedMoves = triageMoves(generateMoves());
    for (var i = 0; i < triagedMoves.length; ++i) {
      var moves = triagedMoves[i];
      if (moves.length > 0) {
        doMove(randomChoice(moves));
        return;
      }
    }
    // This should never happen, since "pass" is also a neutral move, unless
    // this function is called when the game is already over.
    throw new Error('No moves available!');
  }

  // Simulates a random playout.
  //
  // This is only used by the Monte Carlo player.
  function randomPlayout(maxSteps) {
    for (var step = 0; step < maxSteps; ++step) {
      if (getWinner() !== -1) {
        return;  // game over
      }
      playRandomMove();
    }
    log('WARNING: maxSteps exceeded!');
  }

  // Logs the current state to standard output in a human-readable format.
  //
  // This currently only works for rectangular boards without holes, like the
  // default 5x5 board.
  function debugPrint() {
    log('Scores left: ' + scoresLeft);
    log('Pieces left: ' + piecesLeft);
    log('Player ' + (nextPlayer + 1) + ' to move.');
    for (var r = 0; r < cfg.rows; ++r) {
      var line = formatRow(r) + '  ';
      for (var c = 0; c < cfg.cols; ++c) {
        var src = rowColToFieldIndex(cfg, r, c);
        var part = '';
        if (src === -1) {
          part = '#';  // not part of the board
        } else if (fields[src].length === 0) {
          part = '.';  // empty field
        } else {
          for (var i = 0; i < fields[src].length; ++i) {
            part += String(fields[src][i] + 1);
          }
        }
        while (part.length < cfg.winningHeight) part += ' ';
        line += ' ' + part;
        if (src !== -1 && ((occupied & (1 << src)) !== 0) != (fields[src].length !== 0)) {
          log('INTERNAL ERROR: occupied does not match fields at ' + src);
        }
      }
      log(line);
    }
    var line = '   ';
    for (var c = 0; c < cfg.cols; ++c) {
      var part = formatCol(c);
      while (part.length < cfg.winningHeight) part += ' ';
      line += ' ' + part;
    }
    log(line);
    log('last move: ' + (lastMove ? formatMove(cfg, lastMove) : 'none'));
    var moves = generateMoves();
    log(moves.length + ' possible moves: ' + formatMoves(cfg, moves));
  }

  // Returns the state as a JSON-serializable object. This does not do a deep
  // clone, so it's invalidated when the state changes! To prevent this, the
  // caller should serialize the object to a string.
  function toJson() {
    return {fields: fields, nextPlayer: nextPlayer, lastMove: lastMove, scoresLeft: scoresLeft};
  }

  function clone() {
    return StateImpl(cfg, cloneFields(fields), nextPlayer, lastMove,
        cloneArray(scoresLeft), occupied, cloneArray(piecesLeft));
  }

  return {
    getNextPlayer: getNextPlayer,
    getWinner: getWinner,
    generateMoves: generateMoves,
    doMove: doMove,
    undoMove: undoMove,
    evaluate: evaluate,
    triageMoves: triageMoves,
    randomPlayout: randomPlayout,
    debugPrint: debugPrint,
    toJson: toJson,
    clone: clone,
  };
}

// Constructs a new state, possibly from an old state returned by toJson().
// Note that inputJson, if given, MUST be valid, or things will get weird!
export default function State(cfg, inputJson) {
  if (inputJson == null) {
    // Pieces on the board. For each field, we store an array of colors 0 and 1.
    var fields = arrayOfObjects(cfg.fieldCount, Array);

    // Next player to move. Either 0 or 1.
    var nextPlayer = 0;

    // Last move played (to prevent reverting)
    var lastMove = null;

    // Number of towers each player needs to win.
    var scoresLeft = arrayOfValues(cfg.playerCount, cfg.winningScore);

    // Bitmask of occupied fields.
    var occupied = 0;

    // Number of pieces per player.
    var piecesLeft = arrayOfValues(cfg.playerCount, cfg.piecesPerPlayer);
    return StateImpl(cfg, fields, nextPlayer, lastMove, scoresLeft, occupied, piecesLeft);
  } else {
    // Recompute `occupied` and `piecesLeft` from given fields.
    var fields = inputJson.fields;
    var occupied = 0;
    var piecesLeft = arrayOfValues(cfg.playerCount, cfg.piecesPerPlayer);
    for (var i = 0; i < fields.length; ++i) {
      var height = fields[i].length;
      if (height > 0) {
        occupied |= 1 << i;
        for (var j = 0; j < height; ++j) --piecesLeft[fields[i][j]];
      }
    }
    return StateImpl(cfg, fields, inputJson.nextPlayer, inputJson.lastMove, inputJson.scoresLeft, occupied, piecesLeft);
  }
}
