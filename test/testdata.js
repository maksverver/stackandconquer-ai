import {createConfig} from "../src/util.js";

// a1 a2 a3 a4 a5
// b1 b2 b3 b4 b5
// c1 c2 c3 c4 c5
// d1 d2 d3 d4 d5
// e1 e2 e3 e4 e5

export const standardConfig = createConfig(
  5, 5,
  ('-------' +
   '-.....-' +
   '-.....-' +
   '-.....-' +
   '-.....-' +
   '-.....-' +
   '-------').split(''),
  '#', '-', 1, 5, 2);

export const threePlayerConfig = createConfig(
  5, 5,
  ('-------' +
   '-.....-' +
   '-.....-' +
   '-.....-' +
   '-.....-' +
   '-.....-' +
   '-------').split(''),
  '#', '-', 1, 5, 3);


//             a5
//          b4 b5 b6
//       c3 c4 c5 c6 c7
//    d2 d3 d4 d5 d6 d7 d8
// e1 e2 e3 e4 e5 e6 e7 e8 e9

export const triangleConfig = createConfig(
  5, 9,
  ('####0####' +
   '###000###' +
   '##00000##' +
   '#0000000#' +
   '000000000').split(''),
  '#', '-', 0, 5, 2);
