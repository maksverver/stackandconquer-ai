// A grab bag of utility functions used by other parts of the code.

// Note: unlike console.log(), game.log() supports only a single string argument!
export var log = typeof game === 'object' ? game.log : console.log;

// Creates a static descriptor of a board configuration.
//
// See the final return value for a list of fields. Most importantly, it the
// `moves` field is a template of moves that is used by State.generateMoves()
// to generate valid moves efficiently.
export function createConfig(
    rows, cols, inputFields, outside, padding, paddingSize,
    winningHeight, playerCount) {
  var paddedRows = rows + 2*paddingSize;
  var paddedCols = cols + 2*paddingSize;
  if (inputFields.length !== paddedRows * paddedCols) {
    throw new Error('Invalid length of input fields');
  }
  var apiToFieldIndex = [];
  var fieldIndexToApi = [];
  var fieldCount = 0;
  for (var r1 = 0; r1 < paddedRows; ++r1) {
    for (var c1 = 0; c1 < paddedCols; ++c1) {
      var i = paddedCols * r1 + c1;
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
  var moves = [];
  var DR = [-1, -1, -1,  0,  0, +1, +1, +1];
  var DC = [-1,  0, +1, -1, +1, -1,  0, +1];
  for (var r2 = 0; r2 < paddedRows; ++r2) {
    for (var c2 = 0; c2 < paddedCols; ++c2) {
      var j = paddedCols * r2 + c2;
      if (inputFields[j] === outside || inputFields[j] === padding) continue;
      var dst = moves.length;
      moves.push([]);
      for (var height = 0; height < winningHeight; ++height) {
        moves[dst].push([]);
      }
      for (var dir = 0; dir < 8; ++dir) {
        var dr = DR[dir], dc = DC[dir];
        var mask = 0;
        for (var height = 1; height < winningHeight; ++height) {
          var r1 = r2 - dr*height;
          var c1 = c2 - dc*height;
          if (r1 < 0 || r1 >= paddedRows || c1 < 0 || c1 >= paddedCols) break;
          var i = paddedCols * r1 + c1;
          if (inputFields[i] === outside || inputFields[i] === padding) break;
          var src = apiToFieldIndex[i];
          moves[dst][height].push([src, mask]);
          mask |= 1 << src;
        }
      }
    }
  }

  return Object.freeze({
    apiToFieldIndex: Object.freeze(apiToFieldIndex),
    fieldIndexToApi: Object.freeze(fieldIndexToApi),
    fieldCount: fieldCount,
    moves: Object.freeze(moves),
    winningHeight: winningHeight,
    playerCount: playerCount,
    // These are only used for move parsing/formatting and debug printing:
    rows: rows,
    cols: cols,
    paddingSize: paddingSize,
  });
}

// Converts a compact field index (which must be valid, i.e., an integer between
// 0 and cfg.fieldCount, exclusive) to a [row, col] pair.
export function fieldIndexToRowCol(cfg, index) {
  var i = cfg.fieldIndexToApi[index];
  var pad = cfg.paddingSize;
  var rowStride = pad * 2 + cfg.cols;
  var col = i % rowStride;
  var row = (i - col)/rowStride;
  return [row - pad, col - pad];
}

// Converts a row/column pair to a compact field index, or returns -1 if the
// given coordinates are not part of the board.
export function rowColToFieldIndex(cfg, row, col) {
  var pad = cfg.paddingSize;
  var rowStride = pad * 2 + cfg.cols;
  var res = cfg.apiToFieldIndex[rowStride*(row + pad) + (col + pad)];
  return res == null ? -1 : res;
}

export function arrayOfValues(len, value) {
  var res = [];
  for (var i = 0; i < len; ++i) res.push(value);
  return res;
}

export function arrayOfObjects(len, constructor) {
  var fields = [];
  for (var i = 0; i < len; ++i) fields.push(constructor());
  return fields;
}

export function arrayEquals(a, b) {
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) if (a[i] !== b[i]) return false;
  return true;
}

export function indexOfMove(moves, move) {
  for (var i = 0; i < moves.length; ++i) {
    if (arrayEquals(move, moves[i])) return i;
  }
  return -1;
}

export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)]
}
