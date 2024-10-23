import test from 'node:test';
import {strict as assert} from 'node:assert';
import {parseMove} from '../src/parsing.js';
import * as testdata from './testdata.js';

// Keep in sync with parsing_test.js.
test('parseMove', async (t) => {
  await t.test('standard board', () => {
    const cfg = testdata.standardConfig;
    assert.deepEqual(parseMove(cfg, 'pass'), []);
    assert.deepEqual(parseMove(cfg, 'c2'), [-1, 1,  7]);
    assert.deepEqual(parseMove(cfg, 'a1e5'), [ 0, 1, 24]);
    assert.deepEqual(parseMove(cfg, '2a1e5'), [ 0, 2, 24]);

    // Invalid coordinates
    assert.deepEqual(parseMove(cfg, 'f1'), undefined);
    assert.deepEqual(parseMove(cfg, 'a99'), undefined);
  });

  await t.test('triangular board', () => {
    const cfg = testdata.triangleConfig;
    assert.deepEqual(parseMove(cfg, 'pass'), []);
    assert.deepEqual(parseMove(cfg, 'f3'), [-1, 1, 7]);
    assert.deepEqual(parseMove(cfg, 'e1e5'), [ 0, 1, 20]);
    assert.deepEqual(parseMove(cfg, '3e1e5'), [ 0, 3, 20]);

    // Holes in the board.
    assert.equal(parseMove(cfg, 'a1'), undefined);
    assert.equal(parseMove(cfg, 'd1'), undefined);
    assert.equal(parseMove(cfg, 'i4'), undefined);
  });

  await t.test('wide board', () => {
    assert.deepEqual(parseMove(testdata.wideConfig, 'o2'), [-1, 1, 29]);
  });

  await t.test('tall board', () => {
    assert.deepEqual(parseMove(testdata.tallConfig, 'b15'), [-1, 1, 29]);
  });
});
