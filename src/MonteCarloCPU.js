import {findBestMoves} from "./montecarlo.js";
import {CpuPlayer} from "./cpu-player.js";

const player = new CpuPlayer(findBestMoves);

export function initCPU(jsonBoard) {
  return player.initCpu(jsonBoard);
}

export function callCPU(jsonBoard) {
  return player.callCpu(jsonBoard);
}
