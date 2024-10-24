AI players for StackAndConquer (Mixtour)
========================================

StackAndConquer: https://github.com/ElTh0r0/stackandconquer/

This repository currently contains two different players that share some common
code, based on two different algorithms: Minimax and Monte Carlo.

The source code must remain ECMAScript 6 compatible:
https://github.com/ElTh0r0/stackandconquer/issues/13


RUNNING
--------

To run the text versions of the game, you need Node.js.

% node src/minimax-cli.js

% node src/montecarlo-cli.js


BUILDING
--------

Building the JavaScript bundles that can be used in StackAndConquer requires
npm, GNU make, sed, and a few other command line tools. To build:

% npm install   # only once, to install build dependencies
% make          # to rebuild the bundles

This generates two files:

  - output/MinimaxCPU.js
  - output/MonteCarloCPU.js

These files can be installed in StackAndConquer by moving (or symlinking) the
output files in the StackAndConquer data directory. On Linux, this is:
~/.local/share/stackandconquer/cpu/

For more information, see: https://github.com/ElTh0r0/stackandconquer/wiki


DEVELOPMENT
-----------

ESLint is used to detect bugs. To run:

% npm run lint


To run tests:

% npm test

Or:

% node --test

Or to run all tests, including slow tests:

% npm run all-tests


To show test coverage:

% npm run coverage

(Note the report excludes files which have no coverage at all!)


EOF
