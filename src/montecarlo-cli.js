#!/usr/bin/env node

// Runs the CLI using the Monte Carlo AI.

import {run} from "./cli.js";
import {findBestMoves} from "./montecarlo.js";

run(findBestMoves);
