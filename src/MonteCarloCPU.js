import {findBestMoves} from "./montecarlo.js";
import {callCpuWrapper} from "./cpu-player.js";

export function initCPU() {
  // Nothing to be done for now.
}

export function callCPU(jsonBoard, jsonMoves, nDirection) {
  return callCpuWrapper(jsonBoard, jsonMoves, findBestMoves);
}
