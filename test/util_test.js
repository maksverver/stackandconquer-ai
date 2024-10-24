import test from 'node:test';
import {strict as assert} from 'node:assert';
import * as testdata from './testdata.js';
import * as util from "../src/util.js";

test('createConfig', async (t) => {
  await t.test('standard board', () => {
    assert.deepEqual(testdata.standardConfig, {
      apiToFieldIndex: [
          -1, -1, -1, -1, -1, -1, -1,
          -1,  0,  1,  2,  3,  4, -1,
          -1,  5,  6,  7,  8,  9, -1,
          -1, 10, 11, 12, 13, 14, -1,
          -1, 15, 16, 17, 18, 19, -1,
          -1, 20, 21, 22, 23, 24, -1,
          -1, -1, -1, -1, -1, -1, -1],
      fieldIndexToApi: [
           8,  9, 10, 11, 12,
          15, 16, 17, 18, 19,
          22, 23, 24, 25, 26,
          29, 30, 31, 32, 33,
          36, 37, 38, 39, 40],
      fieldCount: 25,
      moves: [
          [[], [[6, 0], [5, 0], [1, 0]], [[12, 64], [10, 32], [2, 2]], [[18, 4160], [15, 1056], [3, 6]], [[24, 266304], [20, 33824], [4, 14]]],
          [[], [[7, 0], [6, 0], [5, 0], [2, 0], [0, 0]], [[13, 128], [11, 64], [3, 4]], [[19, 8320], [16, 2112], [4, 12]], [[21, 67648]]],
          [[], [[8, 0], [7, 0], [6, 0], [3, 0], [1, 0]], [[14, 256], [12, 128], [10, 64], [4, 8], [0, 2]], [[17, 4224]], [[22, 135296]]],
          [[], [[9, 0], [8, 0], [7, 0], [4, 0], [2, 0]], [[13, 256], [11, 128], [1, 4]], [[18, 8448], [15, 2176], [0, 6]], [[23, 270592]]],
          [[], [[9, 0], [8, 0], [3, 0]], [[14, 512], [12, 256], [2, 8]], [[19, 16896], [16, 4352], [1, 12]], [[24, 541184], [20, 69888], [0, 14]]],
          [[], [[11, 0], [10, 0], [6, 0], [1, 0], [0, 0]], [[17, 2048], [15, 1024], [7, 64]], [[23, 133120], [20, 33792], [8, 192]], [[9, 448]]],
          [[], [[12, 0], [11, 0], [10, 0], [7, 0], [5, 0], [2, 0], [1, 0], [0, 0]], [[18, 4096], [16, 2048], [8, 128]], [[24, 266240], [21, 67584], [9, 384]], []],
          [[], [[13, 0], [12, 0], [11, 0], [8, 0], [6, 0], [3, 0], [2, 0], [1, 0]], [[19, 8192], [17, 4096], [15, 2048], [9, 256], [5, 64]], [[22, 135168]], []],
          [[], [[14, 0], [13, 0], [12, 0], [9, 0], [7, 0], [4, 0], [3, 0], [2, 0]], [[18, 8192], [16, 4096], [6, 128]], [[23, 270336], [20, 69632], [5, 192]], []],
          [[], [[14, 0], [13, 0], [8, 0], [4, 0], [3, 0]], [[19, 16384], [17, 8192], [7, 256]], [[24, 540672], [21, 139264], [6, 384]], [[5, 448]]],
          [[], [[16, 0], [15, 0], [11, 0], [6, 0], [5, 0]], [[22, 65536], [20, 32768], [12, 2048], [2, 64], [0, 32]], [[13, 6144]], [[14, 14336]]],
          [[], [[17, 0], [16, 0], [15, 0], [12, 0], [10, 0], [7, 0], [6, 0], [5, 0]], [[23, 131072], [21, 65536], [13, 4096], [3, 128], [1, 64]], [[14, 12288]], []],
          [[], [[18, 0], [17, 0], [16, 0], [13, 0], [11, 0], [8, 0], [7, 0], [6, 0]], [[24, 262144], [22, 131072], [20, 65536], [14, 8192], [10, 2048], [4, 256], [2, 128], [0, 64]], [], []],
          [[], [[19, 0], [18, 0], [17, 0], [14, 0], [12, 0], [9, 0], [8, 0], [7, 0]], [[23, 262144], [21, 131072], [11, 4096], [3, 256], [1, 128]], [[10, 6144]], []],
          [[], [[19, 0], [18, 0], [13, 0], [9, 0], [8, 0]], [[24, 524288], [22, 262144], [12, 8192], [4, 512], [2, 256]], [[11, 12288]], [[10, 14336]]],
          [[], [[21, 0], [20, 0], [16, 0], [11, 0], [10, 0]], [[17, 65536], [7, 2048], [5, 1024]], [[18, 196608], [3, 2176], [0, 1056]], [[19, 458752]]],
          [[], [[22, 0], [21, 0], [20, 0], [17, 0], [15, 0], [12, 0], [11, 0], [10, 0]], [[18, 131072], [8, 4096], [6, 2048]], [[19, 393216], [4, 4352], [1, 2112]], []],
          [[], [[23, 0], [22, 0], [21, 0], [18, 0], [16, 0], [13, 0], [12, 0], [11, 0]], [[19, 262144], [15, 65536], [9, 8192], [7, 4096], [5, 2048]], [[2, 4224]], []],
          [[], [[24, 0], [23, 0], [22, 0], [19, 0], [17, 0], [14, 0], [13, 0], [12, 0]], [[16, 131072], [8, 8192], [6, 4096]], [[15, 196608], [3, 8448], [0, 4160]], []],
          [[], [[24, 0], [23, 0], [18, 0], [14, 0], [13, 0]], [[17, 262144], [9, 16384], [7, 8192]], [[16, 393216], [4, 16896], [1, 8320]], [[15, 458752]]],
          [[], [[21, 0], [16, 0], [15, 0]], [[22, 2097152], [12, 65536], [10, 32768]], [[23, 6291456], [8, 69632], [5, 33792]], [[24, 14680064], [4, 69888], [0, 33824]]],
          [[], [[22, 0], [20, 0], [17, 0], [16, 0], [15, 0]], [[23, 4194304], [13, 131072], [11, 65536]], [[24, 12582912], [9, 139264], [6, 67584]], [[1, 67648]]],
          [[], [[23, 0], [21, 0], [18, 0], [17, 0], [16, 0]], [[24, 8388608], [20, 2097152], [14, 262144], [12, 131072], [10, 65536]], [[7, 135168]], [[2, 135296]]],
          [[], [[24, 0], [22, 0], [19, 0], [18, 0], [17, 0]], [[21, 4194304], [13, 262144], [11, 131072]], [[20, 6291456], [8, 270336], [5, 133120]], [[3, 270592]]],
          [[], [[23, 0], [19, 0], [18, 0]], [[22, 8388608], [14, 524288], [12, 262144]], [[21, 12582912], [9, 540672], [6, 266240]], [[20, 14680064], [4, 541184], [0, 266304]]]],
      winningHeight: 5,
      playerCount: 2,
      rows: 5,
      cols: 5,
      paddingSize: 1,
    });
  });

  await t.test('triangle board', () => {
    assert.deepEqual(testdata.triangleConfig, {
      apiToFieldIndex: [
        -1, -1, -1, -1,  0, -1, -1, -1, -1,
        -1, -1, -1,  1,  2,  3, -1, -1, -1,
        -1, -1,  4,  5,  6,  7,  8, -1, -1,
        -1,  9, 10, 11, 12, 13, 14, 15, -1,
        16, 17, 18, 19, 20, 21, 22, 23, 24],
      fieldIndexToApi: [
                         4,
                    12, 13, 14,
                20, 21, 22, 23, 24,
            28, 29, 30, 31, 32, 33, 34,
        36, 37, 38, 39, 40, 41, 42, 43, 44
      ],
      fieldCount: 25,
      moves: [
        [[], [[3, 0], [2, 0], [1, 0]], [[8, 8], [6, 4], [4, 2]], [[15, 264], [12, 68], [9, 18]], [[24, 33032], [20, 4164], [16, 530]]],
        [[], [[6, 0], [5, 0], [4, 0], [2, 0], [0, 0]], [[13, 64], [11, 32], [9, 16], [3, 4]], [[22, 8256], [19, 2080], [16, 528]], []],
        [[], [[7, 0], [6, 0], [5, 0], [3, 0], [1, 0], [0, 0]], [[14, 128], [12, 64], [10, 32]], [[23, 16512], [20, 4160], [17, 1056]], []],
        [[], [[8, 0], [7, 0], [6, 0], [2, 0], [0, 0]], [[15, 256], [13, 128], [11, 64], [1, 4]], [[24, 33024], [21, 8320], [18, 2112]], []],
        [[], [[11, 0], [10, 0], [9, 0], [5, 0], [1, 0]], [[20, 2048], [18, 1024], [16, 512], [6, 32], [0, 2]], [[7, 96]], [[8, 224]]],
        [[], [[12, 0], [11, 0], [10, 0], [6, 0], [4, 0], [2, 0], [1, 0]], [[21, 4096], [19, 2048], [17, 1024], [7, 64]], [[8, 192]], []],
        [[], [[13, 0], [12, 0], [11, 0], [7, 0], [5, 0], [3, 0], [2, 0], [1, 0]], [[22, 8192], [20, 4096], [18, 2048], [8, 128], [4, 32], [0, 4]], [], []],
        [[], [[14, 0], [13, 0], [12, 0], [8, 0], [6, 0], [3, 0], [2, 0]], [[23, 16384], [21, 8192], [19, 4096], [5, 64]], [[4, 96]], []],
        [[], [[15, 0], [14, 0], [13, 0], [7, 0], [3, 0]], [[24, 32768], [22, 16384], [20, 8192], [6, 128], [0, 8]], [[5, 192]], [[4, 224]]],
        [[], [[18, 0], [17, 0], [16, 0], [10, 0], [4, 0]], [[11, 1024], [1, 16]], [[12, 3072], [0, 18]], [[13, 7168]]],
        [[], [[19, 0], [18, 0], [17, 0], [11, 0], [9, 0], [5, 0], [4, 0]], [[12, 2048], [2, 32]], [[13, 6144]], [[14, 14336]]],
        [[], [[20, 0], [19, 0], [18, 0], [12, 0], [10, 0], [6, 0], [5, 0], [4, 0]], [[13, 4096], [9, 1024], [3, 64], [1, 32]], [[14, 12288]], [[15, 28672]]],
        [[], [[21, 0], [20, 0], [19, 0], [13, 0], [11, 0], [7, 0], [6, 0], [5, 0]], [[14, 8192], [10, 2048], [2, 64]], [[15, 24576], [9, 3072], [0, 68]], []],
        [[], [[22, 0], [21, 0], [20, 0], [14, 0], [12, 0], [8, 0], [7, 0], [6, 0]], [[15, 16384], [11, 4096], [3, 128], [1, 64]], [[10, 6144]], [[9, 7168]]],
        [[], [[23, 0], [22, 0], [21, 0], [15, 0], [13, 0], [8, 0], [7, 0]], [[12, 8192], [2, 128]], [[11, 12288]], [[10, 14336]]],
        [[], [[24, 0], [23, 0], [22, 0], [14, 0], [8, 0]], [[13, 16384], [3, 256]], [[12, 24576], [0, 264]], [[11, 28672]]],
        [[], [[17, 0], [9, 0]], [[18, 131072], [4, 512]], [[19, 393216], [1, 528]], [[20, 917504], [0, 530]]],
        [[], [[18, 0], [16, 0], [10, 0], [9, 0]], [[19, 262144], [5, 1024]], [[20, 786432], [2, 1056]], [[21, 1835008]]],
        [[], [[19, 0], [17, 0], [11, 0], [10, 0], [9, 0]], [[20, 524288], [16, 131072], [6, 2048], [4, 1024]], [[21, 1572864], [3, 2112]], [[22, 3670016]]],
        [[], [[20, 0], [18, 0], [12, 0], [11, 0], [10, 0]], [[21, 1048576], [17, 262144], [7, 4096], [5, 2048]], [[22, 3145728], [16, 393216], [1, 2080]], [[23, 7340032]]],
        [[], [[21, 0], [19, 0], [13, 0], [12, 0], [11, 0]], [[22, 2097152], [18, 524288], [8, 8192], [6, 4096], [4, 2048]], [[23, 6291456], [17, 786432], [2, 4160]], [[24, 14680064], [16, 917504], [0, 4164]]],
        [[], [[22, 0], [20, 0], [14, 0], [13, 0], [12, 0]], [[23, 4194304], [19, 1048576], [7, 8192], [5, 4096]], [[24, 12582912], [18, 1572864], [3, 8320]], [[17, 1835008]]],
        [[], [[23, 0], [21, 0], [15, 0], [14, 0], [13, 0]], [[24, 8388608], [20, 2097152], [8, 16384], [6, 8192]], [[19, 3145728], [1, 8256]], [[18, 3670016]]],
        [[], [[24, 0], [22, 0], [15, 0], [14, 0]], [[21, 4194304], [7, 16384]], [[20, 6291456], [2, 16512]], [[19, 7340032]]],
        [[], [[23, 0], [15, 0]], [[22, 8388608], [8, 32768]], [[21, 12582912], [3, 33024]], [[20, 14680064], [0, 33032]]]],
      winningHeight: 5,
      playerCount: 2,
      rows: 5,
      cols: 9,
      paddingSize: 0
    });
  });
});

test('fieldIndexToRowCol', async (t) => {
  await t.test('standard board', () => {
    const cfg = testdata.standardConfig;
    assert.deepEqual(util.fieldIndexToRowCol(cfg,  0), [0, 0]);
    assert.deepEqual(util.fieldIndexToRowCol(cfg,  1), [0, 1]);
    assert.deepEqual(util.fieldIndexToRowCol(cfg,  4), [0, 4]);
    assert.deepEqual(util.fieldIndexToRowCol(cfg,  5), [1, 0]);
    assert.deepEqual(util.fieldIndexToRowCol(cfg,  6), [1, 1]);
    assert.deepEqual(util.fieldIndexToRowCol(cfg, 12), [2, 2]);
    assert.deepEqual(util.fieldIndexToRowCol(cfg, 20), [4, 0]);
    assert.deepEqual(util.fieldIndexToRowCol(cfg, 24), [4, 4]);
    // Technically these are undefined behavior:
    assert.deepEqual(util.fieldIndexToRowCol(cfg, -1), [NaN, NaN]);
    assert.deepEqual(util.fieldIndexToRowCol(cfg, 25), [NaN, NaN]);
  });

  await t.test('triangle board', () => {
    const cfg = testdata.triangleConfig;
    assert.deepEqual(util.fieldIndexToRowCol(cfg,  0), [0, 4]);
    assert.deepEqual(util.fieldIndexToRowCol(cfg,  1), [1, 3]);
    assert.deepEqual(util.fieldIndexToRowCol(cfg,  2), [1, 4]);
    assert.deepEqual(util.fieldIndexToRowCol(cfg,  3), [1, 5]);
    assert.deepEqual(util.fieldIndexToRowCol(cfg, 16), [4, 0]);
    assert.deepEqual(util.fieldIndexToRowCol(cfg, 24), [4, 8]);
  });
});

test('rowColToFieldIndex', async (t) => {
  await t.test('standard board', () => {
    const cfg = testdata.standardConfig;
    assert.deepEqual(util.rowColToFieldIndex(cfg, 0, 0),  0);
    assert.deepEqual(util.rowColToFieldIndex(cfg, 0, 1),  1);
    assert.deepEqual(util.rowColToFieldIndex(cfg, 0, 4),  4);
    assert.deepEqual(util.rowColToFieldIndex(cfg, 1, 0),  5);
    assert.deepEqual(util.rowColToFieldIndex(cfg, 1, 1),  6);
    assert.deepEqual(util.rowColToFieldIndex(cfg, 2, 2), 12);
    assert.deepEqual(util.rowColToFieldIndex(cfg, 4, 0), 20);
    assert.deepEqual(util.rowColToFieldIndex(cfg, 4, 4), 24);

    assert.deepEqual(util.rowColToFieldIndex(cfg,  4,  5), -1);
    assert.deepEqual(util.rowColToFieldIndex(cfg,  5,  4), -1);
    assert.deepEqual(util.rowColToFieldIndex(cfg, -1,  0), -1);
    assert.deepEqual(util.rowColToFieldIndex(cfg,  0, -1), -1);
    assert.deepEqual(util.rowColToFieldIndex(cfg, 99, 99), -1);
  });

  await t.test('triangle board', () => {
    const cfg = testdata.triangleConfig;
    assert.deepEqual(util.rowColToFieldIndex(cfg, 0, 4),  0);
    assert.deepEqual(util.rowColToFieldIndex(cfg, 1, 3),  1);
    assert.deepEqual(util.rowColToFieldIndex(cfg, 1, 4),  2);
    assert.deepEqual(util.rowColToFieldIndex(cfg, 1, 5),  3);
    assert.deepEqual(util.rowColToFieldIndex(cfg, 4, 0), 16);
    assert.deepEqual(util.rowColToFieldIndex(cfg, 4, 8), 24);
  });
});

test('arrayOfValues', async (t) => {
  await t.test('empty array', () => {
    assert.deepEqual(util.arrayOfValues(0), []);
  });

  await t.test('primitive copies', () => {
    assert.deepEqual(util.arrayOfValues(3, 42), [42, 42, 42]);
  });

  await t.test('object copies', () => {
    const a = util.arrayOfValues(3, {});
    assert.equal(a[0], a[1]);
    assert.equal(a[1], a[2]);
  });
});

test('arrayOfObjects', async (t) => {
  await t.test('empty array', () => {
    assert.deepEqual(util.arrayOfObjects(0, Array), []);
  });

  await t.test('primite copies', () => {
    assert.deepEqual(util.arrayOfObjects(3, Number), [0, 0, 0]);
  });

  await t.test('object copies', () => {
    const a = util.arrayOfObjects(3, Array);
    assert.deepEqual(a, [[], [], []]);
    assert.notEqual(a[0], a[1]);
    assert.notEqual(a[0], a[2]);
    assert.notEqual(a[1], a[2]);
  });
});

test('arrayEquals', () => {
  assert.ok(util.arrayEquals([], []));
  assert.ok(util.arrayEquals([1,2,3], [1,2,3]));
  assert.ok(!util.arrayEquals([], [1,2,3]));
  assert.ok(!util.arrayEquals([1, 2, 3], []));
  assert.ok(!util.arrayEquals([1, 2, 3], [1, 2]));
  assert.ok(!util.arrayEquals([1, 2], [1, 2, 3]));
  assert.ok(!util.arrayEquals([{}], [{}]));
  assert.ok(!util.arrayEquals({}, []));
});

test('indexOfMove', () => {
  assert.equal(util.indexOfMove([], []), -1);
  assert.equal(util.indexOfMove([[]], []), 0);
  assert.equal(util.indexOfMove([[1,2,3], [4, 5, 6]], [1, 2, 3]), 0);
  assert.equal(util.indexOfMove([[1,2,3], [4, 5, 6]], [4, 5, 6]), 1);
  assert.equal(util.indexOfMove([[1,2,3], [4, 5, 6]], [7, 8, 9]), -1);
  assert.equal(util.indexOfMove([[1,2,3], [4, 5, 6]], []), -1);
});

test('randomChoice', async t => {
  await t.test('basic functionality', () => {
    assert.equal(util.randomChoice([]), undefined);
    assert.equal(util.randomChoice([42]), 42);
    assert.equal(util.randomChoice([1, 1, 1]), 1);
  });

  await t.test('random test', () => {
    // Pick a random value from a set of three, 3000 times. We expect each
    // value to be picked around a 1000 times. We check that the true count lies
    // between 800 and 1200 which should be loose enough that the test can't
    // fail randomly.
    let counts = {a: 0, b: 0, c: 0};
    const keys = Object.keys(counts);
    for (let i = 0; i < 3000; ++i) {
      counts[util.randomChoice(keys)]++;
    }
    const values = Object.values(counts);
    assert.ok(Math.min(...values) > 800, values);
    assert.ok(Math.max(...values) < 1200, values);
  });
});
