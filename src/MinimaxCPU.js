import {findBestMoves} from "./minimax.js";
import {callCpuWrapper} from "./cpu-player.js";

export function initCPU() {
  if (game.getNumOfPlayers() !== 2) {
    throw new Error('Unsupported number of players!');
  }
}

export function callCPU(jsonBoard) {
  return callCpuWrapper(jsonBoard, findBestMoves);
}
