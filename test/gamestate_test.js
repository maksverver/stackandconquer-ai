import test, {afterEach, beforeEach, suite} from 'node:test';
import * as util from '../src/util.js';
import {strict as assert} from 'node:assert';
import * as gamestate from '../src/gamestate.js';
import {formatMove, formatMoves} from '../src/formatting.js'
import * as testdata from './testdata.js';
import {parseMoves, replay} from './testutil.js';

suite('debugPrint', () => {
  let oldLog = null;
  let logged = null;
  beforeEach(() => {
    oldLog = util.getLogDelegateForTest();
    logged = '';
    util.setLogDelegateForTest(line => logged += line + '\n');
  });
  afterEach(() => {
    util.setLogDelegateForTest(oldLog);
    oldLog = null;
    logged = null;
  });

  test('standard board', () => {
    const cfg = testdata.standardConfig;
    const state = gamestate.createInitialState(cfg);
    replay(cfg, state, 'a2 b3 a2b3 e5');

    gamestate.debugPrint(state);

    assert.equal(logged, `\
Scores left: 1,1
Pieces left: 19,18
Player 1 to move.
1   .     .     .     .     .
2   .     .     .     .     .
3   .     21    .     .     .
4   .     .     .     .     .
5   .     .     .     .     2
    a     b     c     d     e
last move: e5
23 possible moves: a1 b1 c1 d1 e1 a2 b2 c2 d2 e2 a3 c3 d3 e3 a4 b4 c4 d4 e4 a5 b5 c5 d5\n`);
  });

  test('triangle board', () => {
    const cfg = testdata.triangleConfig;
    const state = gamestate.createInitialState(cfg, 10, 3);
    replay(cfg, state, 'e1 e2 e1e2 c4 f3');

    gamestate.debugPrint(state);
    assert.equal(logged, `\
Scores left: 3,3
Pieces left: 8,8
Player 2 to move.
1   #     #     #     #     .     #     #     #     #
2   #     #     #     .     21    .     #     #     #
3   #     #     .     .     .     1     .     #     #
4   #     .     2     .     .     .     .     .     #
5   .     .     .     .     .     .     .     .     .
    a     b     c     d     e     f     g     h     i
last move: f3
25 possible moves: e1 d2 c4e2 f2 c3 d3 e3 e2f3 2e2f3 g3 b4 d4 e4 f4 g4 h4 a5 b5 c5 d5 e5 f5 g5 h5 i5\n`);
  });
});

suite('toJson', () => {
  test('empty board', () => {
    const state = gamestate.createInitialState(testdata.standardConfig, 20, 3);
    assert.deepEqual(state.toJson(), {
      fields: [
        [], [], [], [], [],
        [], [], [], [], [],
        [], [], [], [], [],
        [], [], [], [], [],
        [], [], [], [], [],
      ],
      lastMove: null,
      nextPlayer: 0,
      piecesLeft: [20, 20],
      scoresLeft: [3, 3],

    });
  });

  test('empty board', () => {
    const cfg = testdata.standardConfig;
    const state = gamestate.createInitialState(cfg, 20, 3);
    replay(cfg, state, 'a2 b3 a2b3 e5');
    assert.deepEqual(state.toJson(), {
      fields: [
        [],     [],     [],     [],     [],
        [],     [],     [],     [],     [],
        [],     [1, 0], [],     [],     [],
        [],     [],     [],     [],     [],
        [],     [],     [],     [],     [1],
      ],
      lastMove: [-1, 1, 24],
      nextPlayer: 0,
      piecesLeft: [19, 18],
      scoresLeft: [3, 3],
    });
  });
});

test('createStateFromJson', () => {
  const cfg = testdata.standardConfig;
  const json = {
    fields: [
    // a      b        c       d       e
      [],     [],     [],     [],     [],  // 1
      [],     [],     [],     [],     [],  // 2
      [],     [1, 0], [],     [0],    [],  // 3
      [],     [],     [1],    [],     [],  // 4
      [],     [],     [],     [1],    [],  // 5
    ],
    lastMove: [-1, 1, 24],
    nextPlayer: 0,
    piecesLeft: [18, 17],
    scoresLeft: [1, 1],
  };
  const state = gamestate.createStateFromJson(cfg, json);
  assert.deepEqual(
    state.generateMoves().map(move => formatMove(cfg, move)),
    'a1 b1 c1 d1 e1 a2 b2 c2 d2 e2 a3 d3b3 c3 c4d3 e3 a4 b4 d5c4 d3c4 b3c4 2b3c4 d4 e4 a5 b5 c5 c4d5 e5'.split(' '));
});

test('random playthrough', () => {
  const cfg = testdata.threePlayerTriangleConfig;
  const state = gamestate.createInitialState(cfg, 99, 3);

  const history = [];

  let player = 0;
  for (;;) {
    assert.equal(state.getNextPlayer(), player);
    const moves = state.generateMoves();
    if (moves.length === 0) break;
    const move = util.randomChoice(moves);
    history.push([player, moves, move, state.doMove(move)]);
    player = (player + (move.length === 0 ? 2 : 1)) % 3;
  }

  const winner = state.getWinner();

  // Undo all moves:
  for (let i = history.length - 1; i >= 0; --i) {
    const [player, moves, move, undoState] = history[i];
    state.undoMove(move, undoState);
    assert.equal(state.getNextPlayer(), player);
    assert.deepEqual(state.generateMoves(), moves);
  }

  // Redo all moves:
  for (let i = 0; i < history.length; ++i) {
    const [player, moves, move] = history[i];
    assert.equal(state.getNextPlayer(), player);
    assert.deepEqual(state.generateMoves(), moves);
    state.doMove(move);
  }

  assert.equal(state.getWinner(), winner);
});

suite('getWinner', () => {
  test('player 1', () => {
    const cfg = testdata.standardConfig;
    const state = gamestate.createInitialState(cfg);
    replay(cfg, state, 'a1 b1 a3 b1a1 a3a1 d3 c3 d3c3 e4 d5 e5 d5e4 2e4e5 3a1c3');
    assert.equal(state.getWinner(), 0);
  });
  test('player 2', () => {
    const cfg = testdata.standardConfig;
    const state = gamestate.createInitialState(cfg);
    replay(cfg, state, 'a1 b1 a3 b1a1 a3a1 d3 c3 d3c3 e4 d5 e5 d5e4 2e4e5 3e5c3');
    assert.equal(state.getWinner(), 1);
  });
});


test('clone', () => {
  const cfg = testdata.standardConfig;
  const baseState = gamestate.createInitialState(cfg, 20, 3);
  replay(cfg, baseState, 'a1 b1 a3 b1a1 a3a1 d3 c3 d3c3 e4 d5 e5 d5e4 2e4e5');

  const state1 = baseState.clone();
  const state2 = baseState.clone(1);

  assert.deepEqual(baseState, state1);
  assert.deepEqual(
    {...state1.toJson(), scoresLeft: [1, 1]},
    {...state2.toJson()});
  assert.deepEqual(baseState.generateMoves(), state1.generateMoves());
  assert.deepEqual(baseState.generateMoves(), state2.generateMoves());

  replay(cfg, state1, '3a1c3');
  replay(cfg, state2, '3e5c3');

  assert.equal(state1.getWinner(), -1);
  assert.equal(state2.getWinner(), 1);

  assert.deepEqual(state1.scoresLeft, [2, 3]);
  assert.deepEqual(state2.scoresLeft, [1, 0]);
});


test('triageMoves', () => {
  const cfg = testdata.standardConfig;
  const state = gamestate.createInitialState(cfg);
  replay(cfg, state, 'a1 b1 a3 b1a1 a3a1 d3 c3 d3c3 e4 d5 e5 d5e4 2e4e5');

  const inputMoves = parseMoves(cfg, '2e5c3 3a1c3 c1 3e5c3');
  const triagedMoves = gamestate.triageMoves(state, inputMoves);

  assert.deepEqual(
    triagedMoves.map(moves => formatMoves(cfg, moves)),
    ['3e5c3', '2e5c3 c1', '3a1c3']);
});

test('randomPlayout', () => {
  const cfg = testdata.standardConfig;
  const state = gamestate.createInitialState(cfg);

  // Hit maxsteps
  let steps = gamestate.randomPlayout(state, 3);
  assert.equal(steps, 3);
  assert.equal(state.getNextPlayer(), 1);
  assert.equal(state.getWinner(), -1);

  // Continue until finished (statistically virtually guaranteed)
  steps = gamestate.randomPlayout(state, 1000);
  assert.ok(6 <= steps && steps < 1000, steps);
  assert.ok(state.getWinner() !== -1);
});
