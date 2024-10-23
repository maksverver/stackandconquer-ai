import {findBestMoves} from "./minimax.js";
import {CpuPlayer} from "./cpu-player.js";

const player = new CpuPlayer(findBestMoves);

export function initCPU(jsonBoard) {
  if (game.getNumOfPlayers() !== 2) {
    throw new Error('Unsupported number of players!');
  }
  return player.initCpu(jsonBoard);
}

export function callCPU(jsonBoard) {
  return player.callCpu(jsonBoard);
}
