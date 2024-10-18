#!/usr/bin/env node

// Runs the CLI using the Minimax AI.

import {run} from "./cli.js";
import {findBestMoves} from "./minimax.js";

run(findBestMoves);
