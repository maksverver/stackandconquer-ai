import test, {suite} from 'node:test';
import {strict as assert} from 'node:assert';
import * as formatting from '../src/formatting.js';
import * as testdata from './testdata.js';

test('formatRow', () => {
  assert.equal(formatting.formatRow(0), '1');
  assert.equal(formatting.formatRow(8), '9');
  assert.equal(formatting.formatRow(9), '10');
  assert.equal(formatting.formatRow(98), '99');
  assert.equal(formatting.formatRow(99), '100');
});

test('formatCol', () => {
  assert.equal(formatting.formatCol( 0), 'a');
  assert.equal(formatting.formatCol(25), 'z');
});

suite('formatField', () => {
  test('standard board', () => {
    const cfg = testdata.standardConfig;
    assert.equal(formatting.formatField(cfg,  0), 'a1');
    assert.equal(formatting.formatField(cfg,  1), 'b1');
    assert.equal(formatting.formatField(cfg,  4), 'e1');
    assert.equal(formatting.formatField(cfg,  5), 'a2');
    assert.equal(formatting.formatField(cfg, 20), 'a5');
    assert.equal(formatting.formatField(cfg, 24), 'e5');
  });

  test('triangular board', () => {
    const cfg = testdata.triangleConfig;
    assert.equal(formatting.formatField(cfg,  0), 'e1');
    assert.equal(formatting.formatField(cfg,  1), 'd2');
    assert.equal(formatting.formatField(cfg,  2), 'e2');
    assert.equal(formatting.formatField(cfg,  3), 'f2');
    assert.equal(formatting.formatField(cfg, 16), 'a5');
    assert.equal(formatting.formatField(cfg, 24), 'i5');
  });
});

// Keep in sync with parsing_test.js.
suite('formatMove', () => {
  test('standard board', () => {
    const cfg = testdata.standardConfig;
    assert.equal(formatting.formatMove(cfg, []), 'pass');
    assert.equal(formatting.formatMove(cfg, [-1, 1,  7]), 'c2');
    assert.equal(formatting.formatMove(cfg, [ 0, 1, 24]), 'a1e5');
    assert.equal(formatting.formatMove(cfg, [ 0, 2, 24]), '2a1e5');
  });

  test('triangular board', () => {
    const cfg = testdata.triangleConfig;
    assert.equal(formatting.formatMove(cfg, []), 'pass');
    assert.equal(formatting.formatMove(cfg, [-1, 1, 7]), 'f3');
    assert.equal(formatting.formatMove(cfg, [ 0, 1, 20]), 'e1e5');
    assert.equal(formatting.formatMove(cfg, [ 0, 3, 20]), '3e1e5');
  });
});

test('formatMoves', () => {
  assert.equal(
    formatting.formatMoves(
        testdata.standardConfig,
        [[-1, 1, 7], [0, 1, 24], [0, 2, 24], []]),
    'c2 a1e5 2a1e5 pass');
});
