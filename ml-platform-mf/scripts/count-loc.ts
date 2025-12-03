import sloc from 'sloc'
import {promisify} from 'util'
import {GitFiles} from './internal/gitOperations'
const fs = require('fs')

const readFile = promisify(fs.readFile)
const extensions = {
  ts: {pattern: '.*.(ts)$', excludes: ['.*.(test|bm).ts$'], fileType: 'ts'},
  tsx: {pattern: '.*.(tsx)$', excludes: ['.*.(test|bm).tsx$'], fileType: 'tsx'},
  json: {pattern: '.*.(json)$', excludes: [], fileType: 'js'},
  tests: {pattern: '.*.(test.ts)$', excludes: [], fileType: 'ts'},
  benchmarks: {pattern: '.*.(bm.ts)$', excludes: [], fileType: 'ts'}
}
type Keys = keyof typeof extensions
const locInfo: any = {}
const getSLOCInfo = async () => {
  const git = new GitFiles()
  const gitFiles = git.getFiles()
  for (let extension in extensions) {
    const excludePattern: string[] = extensions[extension as Keys].excludes
    const files = gitFiles
      .filter((file) => file.match(extensions[extension as Keys].pattern))
      .filter(
        (file) =>
          !excludePattern.reduce<boolean>(
            (acc, excPattern) => acc || !!file.match(excPattern),
            false
          )
      )
    const readQueue = [] as Promise<string>[]
    files.forEach((file) => {
      readQueue.push(readFile(file, 'utf8'))
    })
    locInfo[extension] = {
      sloc: 0,
      numOfFiles: files.length,
      todo: 0
    }
    await Promise.all(readQueue)
      .then((files) => {
        files.forEach((file: string) => {
          const stats = sloc(file, extensions[extension as Keys].fileType)
          locInfo[extension].sloc = locInfo[extension].sloc + stats.source
          locInfo[extension].todo = locInfo[extension].todo + stats.todo
        })
      })
      .catch(console.error) // tslint:disable-line
  }

  const total = Object.keys(locInfo).reduce((total, extension) => {
    const filesInfo = locInfo[extension]
    total = total + filesInfo.sloc
    return total
  }, 0)
  locInfo['total'] = {
    sloc: total
  }
}

getSLOCInfo()
  .then(() => {
    console.log(locInfo) // tslint:disable-line
  })
  .catch(console.error) // tslint:disable-line
