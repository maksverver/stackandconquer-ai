import {findBestMoves} from "./montecarlo.js";
import {callCpuWrapper} from "./cpu-player.js";

export function initCPU() {
  // Nothing to be done for now.
}

export function callCPU(jsonBoard) {
  return callCpuWrapper(jsonBoard, findBestMoves);
}
