#!/usr/bin/env node

// Runs the CLI using the Minimax AI.

import {run} from "./cli.js";
import {evaluateState, findBestMoves} from "./minimax.js";

run(evaluateState, findBestMoves);
