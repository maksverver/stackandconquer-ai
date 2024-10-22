// Text-based interface (requires node.js)
//
// Execute 'help' for a list of commands

import process from 'node:process';
import readline from "node:readline";
import {createInitialState, createStateFromJson, debugPrint} from "./State.js";
import {createConfig, indexOfMove, log} from "./util.js";
import {formatMoves} from "./formatting.js";
import {parseMove} from "./parsing.js";

const helpText = 'StackAndConquer CLI. Supported commands:\n' +
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

const paddedBoard =
    '-------' +
    '-ooooo-' +
    '-ooooo-' +
    '-ooooo-' +
    '-ooooo-' +
    '-ooooo-' +
    '-------';

export function run(evaluateState, findBestMoves) {
  const cfg = createConfig(5, 5, paddedBoard, '#', '-', 1, 5, 2);

  const undoStack = [];
  const redoStack = [];

  let state = createInitialState(cfg);
  debugPrint(state);

  let currentLineHandler = defaultLineHandler;

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
        const item = undoStack.pop();
        redoStack.push(item[0]);
        state.undoMove(item[0], item[1]);
        debugPrint(state);
      }
    } else if (line === 'redo') {
      if (redoStack.length === 0) {
        log('Redo stack is empty!');
      } else {
        const move = redoStack.pop();
        const undoState = state.doMove(move);
        undoStack.push([move, undoState]);
        debugPrint(state);
      }
    } else if (line == 'eval') {
      log(evaluateState(state));
    } else if (line === 'best') {
      const result = findBestMoves(cfg, state, state.generateMoves());
      log(result[0].length + ' best move(s) with value ' + result[1] + ': ' + formatMoves(cfg, result[0]));
    } else {
      const move = parseMove(cfg, line);
      if (move == null) {
        log('Could not parse move!');
      } else if (indexOfMove(state.generateMoves(), move) < 0) {
        log('Invalid move!')
      } else {
        const undoState = state.doMove(move);
        undoStack.push([move, undoState]);
        redoStack.length = 0;
        debugPrint(state);
      }
    }
  }

  function loadLineHandler(line) {
    currentLineHandler = defaultLineHandler;
    try {
      const newState = createStateFromJson(cfg, JSON.parse(line));
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
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout});
  rl.on('line', (line) => currentLineHandler(line));
  rl.once('close', () => log('EOF'));
}
