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

class State {

  constructor(cfg, fields, nextPlayer, lastMove, piecesLeft, scoresLeft, occupied) {
    // Game configuration object as returned by createConfig()
    this.cfg = cfg;
    // Array of fields. Each field is an array with pieces (numbers 0 through 2)
    this.fields = fields;
    // Next player to move (number 0 through 2)
    this.nextPlayer = nextPlayer;
    // Last move played (to prevent reverting, which is illegal) or null
    this.lastMove = lastMove;
    // Array of number of pieces left to place, per player
    this.piecesLeft = piecesLeft;
    // Number of towers each player still needs to conquery to win
    this.scoresLeft = scoresLeft;
    // Bitmask of occupied fields
    this.occupied = occupied;
  }

  getNextPlayer() {
    return this.nextPlayer;
  }

  // Returns the player index of the winner, or -1 if there is no winner.
  getWinner() {
    return this.scoresLeft.indexOf(0);
  }

  _incNextPlayer() {
    ++this.nextPlayer;
    if (this.nextPlayer === this.cfg.playerCount) this.nextPlayer = 0;
}

  _decNextPlayer() {
    if (this.nextPlayer === 0) this.nextPlayer = this.cfg.playerCount;
    --this.nextPlayer;
  }

  _doMoveInternal(move) {
    // This implementation is essentially reversed in undoMove(). Keep the
    // implementations in sync.
    var removed = null;
    if (move.length === 0) {
      // Pass. Play returns to the *previous* player (which is the same as the
      // next player in a 2-player game).
      this._decNextPlayer();
      // Open question: should we update lastMove in this case?
    } else {
      var src = move[0];
      var cnt = move[1];
      var dst = move[2];
      var dstField = this.fields[dst];
      if (src === -1) {
        const player = this.nextPlayer;
        --this.piecesLeft[player];
        dstField.push(player);
        this.occupied ^= 1 << dst;
      } else {
        var srcField = this.fields[src];
        dstField.push(...srcField.splice(srcField.length - cnt));
        if (srcField.length === 0) {
          this.occupied ^= 1 << src;
        }
        if (dstField.length >= this.cfg.winningHeight) {
          removed = dstField.splice(0);
          var winner = removed[removed.length - 1];
          this.scoresLeft[winner] -= 1;
          this.occupied ^= 1 << dst;
          for (var i = 0; i < removed.length; ++i) ++this.piecesLeft[removed[i]];
        }
      }
      this._incNextPlayer();
      this.lastMove = move;
    }
    return removed;
  }

  // Executes a move and returns undo state that can be passed to undoMove() to
  // undo the move.
  //
  // Important: `move` must be valid!
  doMove(move) {
    return [this.lastMove, this._doMoveInternal(move)];
  }

  // Undoes the last move.
  //
  // Important: `move` must be the last move done, and `undoState` must be the
  // unmodified object return by the corresponding call to `doMove()`.
  undoMove(move, undoState) {
    // This implementation is essentially the same as doMoveInternal(), but in
    // reverse. Keep the implementations in sync.
    if (move.length === 0) {
      this._incNextPlayer();
    } else {
      this.lastMove = undoState[0];
      this._decNextPlayer();
      var src = move[0];
      var cnt = move[1];
      var dst = move[2];
      var dstField = this.fields[dst];
      if (src === -1) {
        ++this.piecesLeft[this.nextPlayer];
        dstField.pop();
        this.occupied ^= 1 << dst;
      } else {
        var srcField = this.fields[src];
        var removed = undoState[1];
        if (removed != null) {
          for (var i = 0; i < removed.length; ++i) --this.piecesLeft[removed[i]];
          var winner = removed[removed.length - 1];
          this.scoresLeft[winner] += 1;
          dstField.push(...removed);
          this.occupied ^= 1 << dst;
        }
        if (srcField.length === 0) {
          this.occupied ^= 1 << src;
        }
        srcField.push(...dstField.splice(dstField.length - cnt));
      }
    }
  }

  // Heuristically evaluates the state with respect to the next player.
  //
  // The current evaluation function is not highly optimized. It can probably
  // be optimized significantly.
  //
  // This only works for 2 players and is only used by the Minimax player.
  evaluate() {
    const winner = this.getWinner();
    if (winner !== -1) {
      return winner === this.nextPlayer ? 1000000000 : -1000000000;
    }
    const {cfg, nextPlayer, fields, occupied, scoresLeft} = this;
    const {moves: moveTemplates, winningHeight} = this.cfg;
    var score = 10000 * (scoresLeft[1 - nextPlayer] - scoresLeft[nextPlayer]);
    for (var dst = 0; dst < fields.length; ++dst) {
      var dstField = fields[dst];
      var dstHeight = dstField.length;
      if (dstHeight > 0) {
        var options = moveTemplates[dst][dstHeight];
        for (var i = 0; i < options.length; ++i) {
          var src = options[i][0];
          var srcField = fields[src]
          var srcHeight = srcField.length;
          if (srcHeight + dstHeight >= winningHeight && (occupied & options[i][1]) === 0) {
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
  // A move is a triple [src, cnt, dst], or an empty array [] to pass.
  // If src === -1 and cnt === 1 and a new piece is placed.
  //
  // Rules of the game:
  //  - https://spielstein.com/games/mixtour/rules (2 players)
  //  - https://spielstein.com/games/mixtour/rules/a-trois (3 players)
  generateMoves() {
    if (this.getWinner() !== -1) return [];  // Game is over
    const {cfg, fields, occupied, nextPlayer, lastMove, piecesLeft} = this;
    const {moves: moveTemplates} = cfg;
    var moves = [];
    var lastSrc = -1, lastCnt = 0, lastDst = -1;
    if (lastMove != null && lastMove.length != 0) {
      lastSrc = lastMove[0];
      lastCnt = lastMove[1];
      lastDst = lastMove[2];
    }
    for (var dst = 0; dst < fields.length; ++dst) {
      var dstHeight = fields[dst].length;
      if (dstHeight === 0) {
        if (piecesLeft[nextPlayer]) {
          moves.push([-1, 1, dst]);  // place new piece
        }
      } else {
        var options = moveTemplates[dst][dstHeight];
        for (var i = 0; i < options.length; ++i) {
          var src = options[i][0];
          var srcHeight = fields[src].length;
          if (srcHeight !== 0 && (occupied & options[i][1]) === 0) {
            for (var cnt = 1; cnt <= srcHeight; ++cnt) {
              // Do not allow undoing the last move.
              if (src == lastDst && cnt === lastCnt && dst == lastSrc) continue;
              moves.push([src, cnt, dst]);  // move pieces
            }
          }
        }
      }
    }
    if (moves.length === 0) moves.push(PASS);
    return moves;
  }

  // Classifies the given list of moves into three types: winning, neutral and
  // losing. This is only used by the Monte Carlo player.
  triageMoves(moves) {
    const fields = this.fields;
    const winningHeight = this.cfg.winningHeight;
    var winningMoves = [];
    var neutralMoves = [];
    var losingMoves = [];
    for (var i = 0; i < moves.length; ++i) {
      var move = moves[i];
      if (move.length !== 0 && fields[move[2]].length + move[1] >= winningHeight) {
        var srcField = fields[move[0]];
        if (srcField[srcField.length - 1] === this.nextPlayer) {
          winningMoves.push(move);
        } else {
          losingMoves.push(move);
        }
      } else {
        neutralMoves.push(move);
      }
    }
    return [winningMoves, neutralMoves, losingMoves];
  }

  // Plays a mostly-random move, using the following heuristic: play a winning
  // move if it exists, don't play an immediately losing move if it can be
  // avoided, and otherwise play randomly.
  //
  // This is only used by the Monte Carlo player.
  _playRandomMove() {
    var triagedMoves = this.triageMoves(this.generateMoves());
    for (var i = 0; i < triagedMoves.length; ++i) {
      var moves = triagedMoves[i];
      if (moves.length > 0) {
        var choice = randomChoice(moves);
        this.doMove(choice);
        return;
      }
    }
    // This should never happen, since "pass" is also a neutral move, unless
    // this function is called when the game is already over.
    throw new Error('No moves available!');
  }

  // Simulates a random playout. Returns the number of moves played.
  //
  // This is only used by the Monte Carlo player.
  randomPlayout(maxSteps) {
    for (var step = 0; step < maxSteps; ++step) {
      if (this.getWinner() !== -1) return step;  // game over
      this._playRandomMove();
    }
    return maxSteps;
  }

  // Logs the current state to standard output in a human-readable format.
  debugPrint() {
    const {cfg, fields, occupied, lastMove, nextPlayer, scoresLeft, piecesLeft} = this;
    const {rows, cols, winningHeight} = cfg;
    log('Scores left: ' + scoresLeft);
    log('Pieces left: ' + piecesLeft);
    log('Player ' + (nextPlayer + 1) + ' to move.');
    for (var r = 0; r < rows; ++r) {
      var line = formatRow(r) + '  ';
      for (var c = 0; c < cols; ++c) {
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
        while (part.length < winningHeight) part += ' ';
        line += ' ' + part;
        if (src !== -1 && ((occupied & (1 << src)) !== 0) != (fields[src].length !== 0)) {
          log('INTERNAL ERROR: occupied does not match fields at ' + src);
        }
      }
      log(line);
    }
    var line = '   ';
    for (var c = 0; c < cols; ++c) {
      var part = formatCol(c);
      while (part.length < winningHeight) part += ' ';
      line += ' ' + part;
    }
    log(line);
    log('last move: ' + (lastMove ? formatMove(cfg, lastMove) : 'none'));
    var moves = this.generateMoves();
    log(moves.length + ' possible moves: ' + formatMoves(cfg, moves));
  }

  // Returns the state as a JSON-serializable object. This does not do a deep
  // clone, so it's invalidated when the state changes! To prevent this, the
  // caller should serialize the object to a string.
  toJson() {
    return {
      fields: this.fields,
      nextPlayer: this.nextPlayer,
      lastMove: this.lastMove,
      scoresLeft: this.scoresLeft,
      piecesLeft: this.piecesLeft,
    };
  }

  clone(winningScore) {
    return new State(
      this.cfg,
      cloneFields(this.fields),
      this.nextPlayer,
      this.lastMove,
      cloneArray(this.piecesLeft),
      winningScore == null ? cloneArray(this.scoresLeft) : arrayOfValues(this.cfg.playerCount, winningScore),
      this.occupied,
    );
  }
}

// Creates a state from an object in the same format as produced by toJson(),
// defined above.
//
// Note: the new state takes ownership of mutable inputJson members like
// `fields`, `piecesLeft`, and `scoresLeft`, so the caller should have
// deep-cloned the input JSON before passing it to this function, and not use
// the object afterwards.
export function createStateFromJson(cfg, inputJson) {
  // Recompute `occupied` from given fields.
  var fields = inputJson.fields;
  var occupied = 0;
  for (var i = 0; i < fields.length; ++i) {
    if (fields[i].length > 0) occupied |= 1 << i;
  }
  return new State(cfg, fields, inputJson.nextPlayer, inputJson.lastMove, inputJson.piecesLeft, inputJson.scoresLeft, occupied);
}

// Creates an initial state with an empty board using the given configuration.
//
// piecesLeft can be left undefined to use the default of 20 pieces for a two-
// player game, or 15 pieces for a three-player game, or set to a single number
// that applies to all players, or array of length cfg.playerCount with the
// specific number of pieces per player.
//
// Similarly, scoresLeft can be left undefined to use the default of 1 tower
// needed to win, or set to a number that applies to all players equally, or an
// array of length cfg.playerCount  with the number of towers to score per
// player.
export function createInitialState(cfg, piecesLeft, scoresLeft) {
  if (piecesLeft == null) piecesLeft = cfg.playerCount <= 2 ? 20 : 15;
  if (typeof piecesLeft === 'number') piecesLeft = arrayOfValues(cfg.playerCount, piecesLeft);
  if (scoresLeft == null) scoresLeft = 1;
  if (typeof scoresLeft === 'number') scoresLeft = arrayOfValues(cfg.playerCount, scoresLeft);
  var fields = arrayOfObjects(cfg.fieldCount, Array);
  var nextPlayer = 0;
  var lastMove = null;
  var occupied = 0;
  return new State(cfg, fields, nextPlayer, lastMove, piecesLeft, scoresLeft, occupied);
}
