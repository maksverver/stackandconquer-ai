import {formatRow, formatCol, formatMove, formatMoves} from "./formatting.js";
import {log, arrayOfValues, arrayOfObjects, randomChoice, rowColToFieldIndex} from "./util.js";

// Move that represents passing (an empty array).
const PASS = Object.freeze([]);

function cloneFields(fields) {
  return fields.map(pieces => pieces.slice());
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
    let removed = null;
    if (move.length === 0) {
      // Pass. Play returns to the *previous* player (which is the same as the
      // next player in a 2-player game).
      this._decNextPlayer();
      // Open question: should we update lastMove in this case?
    } else {
      const src = move[0];
      const cnt = move[1];
      const dst = move[2];
      const dstField = this.fields[dst];
      if (src === -1) {
        const player = this.nextPlayer;
        --this.piecesLeft[player];
        dstField.push(player);
        this.occupied ^= 1 << dst;
      } else {
        const srcField = this.fields[src];
        dstField.push(...srcField.splice(srcField.length - cnt));
        if (srcField.length === 0) {
          this.occupied ^= 1 << src;
        }
        if (dstField.length >= this.cfg.winningHeight) {
          removed = dstField.splice(0);
          const winner = removed[removed.length - 1];
          this.scoresLeft[winner] -= 1;
          this.occupied ^= 1 << dst;
          for (const player of removed) ++this.piecesLeft[player];
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
      const src = move[0];
      const cnt = move[1];
      const dst = move[2];
      const dstField = this.fields[dst];
      if (src === -1) {
        ++this.piecesLeft[this.nextPlayer];
        dstField.pop();
        this.occupied ^= 1 << dst;
      } else {
        const srcField = this.fields[src];
        const removed = undoState[1];
        if (removed != null) {
          for (const player of removed) --this.piecesLeft[player];
          const winner = removed[removed.length - 1];
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
    const moves = [];
    let lastSrc = -1, lastCnt = 0, lastDst = -1;
    if (lastMove != null && lastMove.length != 0) {
      lastSrc = lastMove[0];
      lastCnt = lastMove[1];
      lastDst = lastMove[2];
    }
    for (let dst = 0; dst < fields.length; ++dst) {
      const dstHeight = fields[dst].length;
      if (dstHeight === 0) {
        if (piecesLeft[nextPlayer]) {
          moves.push([-1, 1, dst]);  // place new piece
        }
      } else {
        const options = moveTemplates[dst][dstHeight];
        for (let i = 0; i < options.length; ++i) {
          const src = options[i][0];
          const srcHeight = fields[src].length;
          if (srcHeight !== 0 && (occupied & options[i][1]) === 0) {
            for (let cnt = 1; cnt <= srcHeight; ++cnt) {
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
    const scoresLeft = this.scoresLeft.slice();
    if (winningScore != null) scoresLeft.fill(winningScore);
    return new State(
      this.cfg,
      cloneFields(this.fields),
      this.nextPlayer,
      this.lastMove,
      this.piecesLeft.slice(),
      scoresLeft,
      this.occupied);
  }
}

// Heuristically evaluates the state with respect to the next player, without
// searching more deeply. (Although this function does look for possible moves
// that are immedaitely winning.)
//
// The current evaluation function is not highly optimized. It can probably
// be optimized significantly.
//
// This only works for 2 players and is only used by the Minimax player.
export function evaluateImmediately(state) {
  const winner = state.getWinner();
  if (winner !== -1) {
    return winner === state.nextPlayer ? 1000000000 : -1000000000;
  }
  const {cfg, nextPlayer, fields, occupied, scoresLeft} = state;
  const {moves: moveTemplates, winningHeight} = cfg;
  let score = 10000 * (scoresLeft[1 - nextPlayer] - scoresLeft[nextPlayer]);
  for (let dst = 0; dst < fields.length; ++dst) {
    const dstField = fields[dst];
    const dstHeight = dstField.length;
    if (dstHeight > 0) {
      const options = moveTemplates[dst][dstHeight];
      for (const [src, mask] of options) {
        const srcField = fields[src];
        const srcHeight = srcField.length;
        if (srcHeight + dstHeight >= winningHeight && (occupied & mask) === 0) {
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
      for (let i = 0; i < dstHeight; ++i) {
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

// Classifies the given list of moves into three types: winning, neutral and
// losing. This is only used by the Monte Carlo player.
export function triageMoves(state, moves) {
  const {cfg, fields, nextPlayer} = state;
  const {winningHeight} = cfg;
  const winningMoves = [];
  const neutralMoves = [];
  const losingMoves = [];
  for (const move of moves) {
    if (move.length !== 0 && fields[move[2]].length + move[1] >= winningHeight) {
      const srcField = fields[move[0]];
      if (srcField[srcField.length - 1] === nextPlayer) {
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
function playRandomMove(state, allMoves) {
  for (const moves of triageMoves(state, allMoves)) {
    if (moves.length > 0) {
      const choice = randomChoice(moves);
      state.doMove(choice);
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
export function randomPlayout(state, maxSteps) {
  for (let step = 0; step < maxSteps; ++step) {
    const moves = state.generateMoves();
    if (moves.length === 0) return step;  // game over
    playRandomMove(state, moves);
  }
  return maxSteps;
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
  const fields = inputJson.fields;
  let occupied = 0;
  for (let i = 0; i < fields.length; ++i) {
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
  const fields = arrayOfObjects(cfg.fieldCount, Array);
  const nextPlayer = 0;
  const lastMove = null;
  const occupied = 0;
  return new State(cfg, fields, nextPlayer, lastMove, piecesLeft, scoresLeft, occupied);
}

// Logs the current state to standard output in a human-readable format.
export function debugPrint(state) {
  const {cfg, fields, occupied, lastMove, nextPlayer, scoresLeft, piecesLeft} = state;
  const {rows, cols, winningHeight} = cfg;
  log('Scores left: ' + scoresLeft);
  log('Pieces left: ' + piecesLeft);
  log('Player ' + (nextPlayer + 1) + ' to move.');
  for (let r = 0; r < rows; ++r) {
    let line = formatRow(r) + '  ';
    for (let c = 0; c < cols; ++c) {
      const src = rowColToFieldIndex(cfg, r, c);
      let part = '';
      if (src === -1) {
        part = '#';  // not part of the board
      } else if (fields[src].length === 0) {
        part = '.';  // empty field
      } else {
        for (let i = 0; i < fields[src].length; ++i) {
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
  let line = '   ';
  for (let c = 0; c < cols; ++c) {
    let part = formatCol(c);
    while (part.length < winningHeight) part += ' ';
    line += ' ' + part;
  }
  log(line);
  log('last move: ' + (lastMove ? formatMove(cfg, lastMove) : 'none'));
  const moves = state.generateMoves();
  log(moves.length + ' possible moves: ' + formatMoves(cfg, moves));
}
