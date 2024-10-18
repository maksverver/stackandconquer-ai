// Text-based interface (requires node.js)
//
// Execute 'help' for a list of commands

import readline from "node:readline";
import State from "./State.js";
import {createConfig, indexOfMove, log} from "./util.js";
import {formatMoves} from "./formatting.js";
import {parseMove} from "./parsing.js";

var helpText = 'StackAndConquer CLI. Supported commands:\n' +
    '\n' +
    '  save  dumps the current state as a JSON string\n' +
    '  load  loads a state from a JSON string\n' +
    '  undo  undoes the last move\n' +
    '  redo  redoes the move that was last undone\n' +
    '  eval  evaluates the current position\n' +
    '  best  reports the best moves (according to the Minimax search algorithm)\n' +
    '  <move> play a move, where a move is formatted like:\n' +
    '          pass\n' +
    '          a1 (place a new piece on field a1)\n' +
    '          3a1b2 (move 3 pieces from a1 to b2)\n';

export function run(findBestMoves) {
  var cfg = createConfig(5, 5, ".........................", '#', '-', 5, 1, 20, 2);

  var undoStack = [];
  var redoStack = [];
  var state = State(cfg);
  state.debugPrint();

  var currentLineHandler = defaultLineHandler;

  function defaultLineHandler(line) {
    if (line === 'help') {
      log(helpText);
    } else if (line === 'save') {
      log(JSON.stringify(state.toJson()));
    } else if (line === 'load') {
      log('Enter the JSON state to load on the next line:');
      currentLineHandler = loadLineHandler;
    } else if (line === 'undo') {
      if (undoStack.length === 0) {
        log('Undo stack is empty!');
      } else {
        var item = undoStack.pop();
        redoStack.push(item[0]);
        state.undoMove(item[0], item[1]);
        state.debugPrint();
      }
    } else if (line === 'redo') {
      if (redoStack.length === 0) {
        log('Redo stack is empty!');
      } else {
        var move = redoStack.pop();
        var undoState = state.doMove(move);
        undoStack.push([move, undoState]);
        state.debugPrint();
      }
    } else if (line == 'eval') {
      log(state.evaluate());
    } else if (line === 'best') {
      var result = findBestMoves(cfg, state, state.generateMoves());
      log(result[0].length + ' best move(s) with value ' + result[1] + ': ' + formatMoves(cfg, result[0]));
    } else {
      var move = parseMove(cfg, line);
      if (move == null) {
        log('Could not parse move!');
      } else if (indexOfMove(state.generateMoves(), move) < 0) {
        log('Invalid move!')
      } else {
        var undoState = state.doMove(move);
        undoStack.push([move, undoState]);
        redoStack.length = 0;
        state.debugPrint();
      }
    }
  }

  function loadLineHandler(line) {
    currentLineHandler = defaultLineHandler;
    try {
      var newState = State(cfg, JSON.parse(line));
      newState.debugPrint();
      // Order matters here. Only overwrite state if debugPrint() succeeds,
      // so that if the state is invalid, we keep the old state.
      state = newState;
      undoStack.length = 0;
      redoStack.length = 0;
    } catch (e) {
      log(e);
      log('Failed to load JSON state!');
    }
  }

  // Use Node.js readline library to process input.
  var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout});
  rl.on('line', (line) => currentLineHandler(line));
  rl.once('close', () => log('EOF'));
}
