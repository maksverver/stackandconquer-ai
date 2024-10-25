import {strict as assert} from 'node:assert';
import test, {suite} from 'node:test';
import {formatMoves} from '../src/formatting.js';
import {findBestMoves} from '../src/minimax.js';
import {createInitialState} from '../src/gamestate.js';
import * as testdata from './testdata.js';
import {replay} from './testutil.js';

suite('minimax', () => {
  test('findBestMoves', () => {
    const cfg = testdata.standardConfig;
    const state = createInitialState(cfg);

    // Initial state: all moves are equally good.
    {
      const allMoves = state.generateMoves();
      const [bestMoves, value] = findBestMoves(cfg, state, allMoves);
      assert.deepEqual(allMoves, bestMoves);
      assert.equal(value, 0);
    }

    replay(cfg, state, 'c3 a1 d3 d3c3 e3 a1c3 d5 a3 c2 3c3c2 a4 e4 c5 c4 a1 c4c5');

    // Intermediate state with slightly negative value
    {
      const allMoves = state.generateMoves();
      const [bestMoves, value] = findBestMoves(cfg, state, allMoves);
      assert.ok(bestMoves.length < allMoves.length);
      assert.equal(value, -158);
      assert.equal(formatMoves(cfg, bestMoves), 'b4');
    }

    replay(cfg, state, 'a4a3');

    // Detect win-in-2
    {
      const [moves, value] = findBestMoves(cfg, state, state.generateMoves());
      assert.equal(formatMoves(cfg, moves), 'c1');
      assert.equal(value, 1000000001);
    }

    replay(cfg, state, 'c1');

    // Detect loss-in-1
    {
      const [_, value] = findBestMoves(cfg, state, state.generateMoves());
      assert.equal(value, -1000000002);
    }

    replay(cfg, state, 'c5d5');

    // Detect win-in-1
    {
      const [moves, value] = findBestMoves(cfg, state, state.generateMoves());
      assert.equal(formatMoves(cfg, moves), '4c2c1');
      assert.equal(value, 1000000003);
    }

    replay(cfg, state, '4c2c1');
    assert.equal(state.getWinner(), 1);
  });
});
