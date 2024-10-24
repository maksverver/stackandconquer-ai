import process from 'node:process';

export default
    process.env['RUN_SLOW_TESTS'] == 1 ?
        false :
        'slow test skipped; set RUN_SLOW_TESTS=1 to run';
