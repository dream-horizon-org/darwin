#!/usr/bin/env node

const glob = require('glob')

const DEFAULT_IGNORE = ['node_modules/**']
const {env} = process
let files: string[]

switch (env.TEST_SUITE) {
  case 'INTEGRATION:CI':
    files = glob.sync(
      'react-github-actions-build/e2eIntegration/**/*.test.js',
      {
        ignore: ['node_modules']
      }
    )
    break
  case 'UNIT_TEST:CI':
    files = glob.sync('src/**/*.test.ts?(x)', {
      ignore: ['node_modules']
    })
    break
  default: {
    files = glob.sync('**/*.test.ts', {ignore: DEFAULT_IGNORE})
  }
}

const batchCount = env.BATCH_COUNT ? parseInt(env.BATCH_COUNT) : 1
const batchId = env.BATCH_ID ? parseInt(env.BATCH_ID) - 1 : 0
const batchSize = Math.ceil(files.length / batchCount)
const fromId = batchId * batchSize
const toId = fromId + batchSize
const testFiles = files.slice(fromId, toId)

// tslint:disable-next-line: no-console
console.log(testFiles.join('\n'))
