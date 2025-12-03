#!/usr/bin/env node
var glob = require('glob');
var DEFAULT_IGNORE = ['node_modules/**'];
var env = process.env;
var files;
switch (env.TEST_SUITE) {
    case 'INTEGRATION:CI':
        files = glob.sync('react-github-actions-build/e2eIntegration/**/*.test.js', {
            ignore: ['node_modules']
        });
        break;
    case 'UNIT_TEST:CI':
        files = glob.sync('src/**/*.test.ts?(x)', {
            ignore: ['node_modules']
        });
        break;
    default: {
        files = glob.sync('**/*.test.ts', { ignore: DEFAULT_IGNORE });
    }
}
var batchCount = env.BATCH_COUNT ? parseInt(env.BATCH_COUNT) : 1;
var batchId = env.BATCH_ID ? parseInt(env.BATCH_ID) - 1 : 0;
var batchSize = Math.ceil(files.length / batchCount);
var fromId = batchId * batchSize;
var toId = fromId + batchSize;
var testFiles = files.slice(fromId, toId);
// tslint:disable-next-line: no-console
console.log(testFiles.join('\n'));
