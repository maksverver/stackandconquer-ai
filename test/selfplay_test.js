import {strict as assert} from 'node:assert';
import test from 'node:test';
import {findBestMoves as findMinimaxMoves} from '../src/minimax.js';
import {findBestMoves as findMonteCarloMoves} from '../src/montecarlo.js';
import {indexOfMove, randomChoice, log} from '../src/util.js';
import {formatMove} from '../src/formatting.js';
import {createInitialState, debugPrint} from '../src/gamestate.js';
import skip from './skip_slow.js';
import * as testdata from './testdata.js';

function findDummyMoves(cfg, state, moves) {
  return [moves, 0];
}

function playGame(cfg, state, players, maxMoves=1000) {
  let passCount = 0;
  for (let i = 0; i < maxMoves; ++i) {
    const moves = state.generateMoves();
    if (moves.length === 0) return true;  // game finished

    const nextPlayer = state.getNextPlayer();
    const findBestMoves = players[nextPlayer];
    const [bestMoves, unusedValue] = findBestMoves(cfg, state, moves);
    assert.ok(bestMoves.length > 0);
    const move = randomChoice(bestMoves);
    assert.ok(indexOfMove(moves, move) >= 0, move);
    state.doMove(move);

    if (false) {
      log(`Player ${nextPlayer + 1} selected move ${formatMove(cfg, move)}`);
      debugPrint(state);
    }

    // Detect pass cycles:
    passCount = move.length === 0 ? passCount + 1 : 0;
    if (passCount === players.length) return false;
  }
}

test('selfplay', {skip}, async t => {

  await t.test('regular board', async t => {
    const cfg = testdata.standardConfig;

    await t.test('dummy vs Monte Carlo', () => {
      const state = createInitialState(cfg, 20, 1);
      const players = [findDummyMoves, findMonteCarloMoves];

      playGame(cfg, state, players);

      assert(state.getWinner() === 1);  // assume Monte Carlo wins
    });


    await t.test('Monte Carlo vs Minimax', () => {
      const state = createInitialState(cfg, 20, 3);  // note three rounds
      const players = [findMonteCarloMoves, findMinimaxMoves];

      playGame(cfg, state, players);

      assert(state.getWinner() === 1);  // assume Minimax wins
    });
  });

  await t.test('triangular board', () => {
    const cfg = testdata.triangleConfig;
    const state = createInitialState(cfg, 20, 1);  // note only 1 round

    playGame(cfg, state, [findMinimaxMoves, findMonteCarloMoves]);

    assert.ok(state.getWinner() >= 0);
  });

  await t.test('three player game', async t => {
    const cfg = testdata.threePlayerConfig;

    await t.test('Monte Carlo vs itself', () => {
      const state = createInitialState(cfg, 15, 1);
      const players = [findMonteCarloMoves, findMonteCarloMoves, findMonteCarloMoves];

      const finished = playGame(cfg, state, players);

      // Three player games sometimes end without a winner.
      assert(state.getWinner() >= 0 || !finished);
    });

    await t.test('Monte Carlo vs dummies', () => {
      const state = createInitialState(cfg, 15, 1);

      playGame(cfg, state, [findDummyMoves, findMonteCarloMoves, findDummyMoves]);

      assert(state.getWinner() === 1);
    });

  });
});
