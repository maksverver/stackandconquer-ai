import {createConfig} from "../src/util.js";

// a1 b1 c1 d1 e1
// a2 b2 c2 d2 e2
// a3 b3 c3 d3 e3
// a4 b4 c4 d4 e4
// a5 b5 c5 d5 e5

const square5x5x1 = (
    '-------' +
    '-.....-' +
    '-.....-' +
    '-.....-' +
    '-.....-' +
    '-.....-' +
    '-------').split('');

export const standardConfig = createConfig(5, 5, square5x5x1, '#', '-', 1, 5, 2);
export const threePlayerConfig = createConfig(5, 5, square5x5x1, '#', '-', 1, 5, 3);

//             e1
//          d2 e2 f2
//       c3 d3 e3 f3 g3
//    b4 c4 d4 e4 f4 g4 h4
// a5 b5 c5 d5 e5 f5 g5 h5 i5

const triangle5x9x0 =
    '####0####' +
    '###000###' +
    '##00000##' +
    '#0000000#' +
    '000000000';

export const triangleConfig = createConfig(5, 9, triangle5x9x0, '#', '-', 0, 5, 2);
export const threePlayerTriangleConfig = createConfig(5, 9, triangle5x9x0, '#', '-', 0, 5, 3);

export const wideConfig = createConfig(2, 15, '..............................', '#', '-', 0, 5, 2);
export const tallConfig = createConfig(15, 2, '..............................', '#', '-', 0, 5, 2);
