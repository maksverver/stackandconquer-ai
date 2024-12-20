// util.js -- a grab bag of utility functions used by other parts of the code.
//
// eslint-disable-next-line no-undef
let logDelegate = typeof game === 'object' ? game.log : console.log;

export function getLogDelegateForTest() { return logDelegate; }
export function setLogDelegateForTest(fn) { logDelegate = fn; }

// Note: unlike console.log(), game.log() supports only a single string argument!
export function log(...args) {
  if (args.length !== 1) {
    throw new Error('log() expects exactly 1 argument!');
  }
  logDelegate(args[0]);
}

// Creates a static descriptor of a board configuration.
//
// See the final return value for a list of fields. Most importantly, it the
// `moves` field is a template of moves that is used by State.generateMoves()
// to generate valid moves efficiently.
export function createConfig(
    rows, cols, inputFields, outside, padding, paddingSize,
    winningHeight, playerCount) {
  const paddedRows = rows + 2*paddingSize;
  const paddedCols = cols + 2*paddingSize;
  if (inputFields.length !== paddedRows * paddedCols) {
    throw new Error('Invalid length of input fields');
  }
  const apiToFieldIndex = [];
  const fieldIndexToApi = [];
  let fieldCount = 0;
  for (let r1 = 0; r1 < paddedRows; ++r1) {
    for (let c1 = 0; c1 < paddedCols; ++c1) {
      const i = paddedCols * r1 + c1;
      if (inputFields[i] === outside || inputFields[i] === padding) {
        apiToFieldIndex.push(-1);
      } else {
        apiToFieldIndex.push(fieldCount++);
        fieldIndexToApi.push(i);
      }
    }
  }
  if (fieldCount > 30) {
    throw new Error('Too many fields (maximum supported: 30)');
  }

  // moves[dst][height] is an array of [src, mask] fields, where
  // mask is a bitmask of fields between src and dst.
  const moves = [];
  const DR = [-1, -1, -1,  0,  0, +1, +1, +1];
  const DC = [-1,  0, +1, -1, +1, -1,  0, +1];
  for (let r2 = 0; r2 < paddedRows; ++r2) {
    for (let c2 = 0; c2 < paddedCols; ++c2) {
      const j = paddedCols * r2 + c2;
      if (inputFields[j] === outside || inputFields[j] === padding) continue;
      const dst = moves.length;
      moves.push([]);
      for (let height = 0; height < winningHeight; ++height) {
        moves[dst].push([]);
      }
      for (let dir = 0; dir < 8; ++dir) {
        const dr = DR[dir], dc = DC[dir];
        let mask = 0;
        for (let height = 1; height < winningHeight; ++height) {
          const r1 = r2 - dr*height;
          const c1 = c2 - dc*height;
          if (r1 < 0 || r1 >= paddedRows || c1 < 0 || c1 >= paddedCols) break;
          const i = paddedCols * r1 + c1;
          if (inputFields[i] === outside || inputFields[i] === padding) break;
          const src = apiToFieldIndex[i];
          moves[dst][height].push([src, mask]);
          mask |= 1 << src;
        }
      }
    }
  }

  return Object.freeze({
    apiToFieldIndex: Object.freeze(apiToFieldIndex),
    fieldIndexToApi: Object.freeze(fieldIndexToApi),
    fieldCount,
    moves: Object.freeze(moves),
    winningHeight,
    playerCount,
    // These are only used for move parsing/formatting and debug printing:
    rows,
    cols,
    paddingSize,
  });
}

// Converts a compact field index (which must be valid, i.e., an integer between
// 0 and cfg.fieldCount, exclusive) to a [row, col] pair.
export function fieldIndexToRowCol(cfg, index) {
  const i = cfg.fieldIndexToApi[index];
  const pad = cfg.paddingSize;
  const rowStride = pad * 2 + cfg.cols;
  const col = i % rowStride;
  const row = (i - col)/rowStride;
  return [row - pad, col - pad];
}

// Converts a row/column pair to a compact field index, or returns -1 if the
// given coordinates are not part of the board.
export function rowColToFieldIndex(cfg, row, col) {
  const pad = cfg.paddingSize;
  const rowStride = pad * 2 + cfg.cols;
  const res = cfg.apiToFieldIndex[rowStride*(row + pad) + (col + pad)];
  return res == null ? -1 : res;
}

// Returns a new array of the given length where each element is `value`.
export function arrayOfValues(len, value) {
  const res = [];
  for (let i = 0; i < len; ++i) res.push(value);
  return res;
}

// Returns a new array of the given length where element are initialized by
// calling `constructor()`.
export function arrayOfObjects(len, constructor) {
  const fields = [];
  for (let i = 0; i < len; ++i) fields.push(constructor());
  return fields;
}

export function arrayEquals(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) if (a[i] !== b[i]) return false;
  return true;
}

export function indexOfMove(moves, move) {
  for (let i = 0; i < moves.length; ++i) {
    if (arrayEquals(move, moves[i])) return i;
  }
  return -1;
}

export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)]
}
