import {findBestMoves} from "./minimax.js";
import {callCpuWrapper, initCpuWrapper} from "./cpu-player.js";

let cfg = null;

export function initCPU(jsonBoard) {
  if (game.getNumOfPlayers() !== 2) {
    throw new Error('Unsupported number of players!');
  }
  cfg = initCpuWrapper(jsonBoard);
}

export function callCPU(jsonBoard) {
  if (cfg == null) throw new Error('initCPU() has not been called!');
  return callCpuWrapper(findBestMoves, cfg, jsonBoard);
}
