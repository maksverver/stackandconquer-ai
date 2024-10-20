import {findBestMoves} from "./montecarlo.js";
import {callCpuWrapper, initCpuWrapper} from "./cpu-player.js";

var cfg = null;

export function initCPU(jsonBoard) {
  cfg = initCpuWrapper(jsonBoard);
}

export function callCPU(jsonBoard) {
  if (cfg == null) throw new Error('initCPU() has not been called!');
  return callCpuWrapper(findBestMoves, cfg, jsonBoard);
}
