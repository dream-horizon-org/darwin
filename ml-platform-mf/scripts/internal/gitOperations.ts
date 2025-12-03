import {execSync} from 'child_process'
import {existsSync, lstatSync} from 'fs'
import {resolve} from 'path'

const exec = execSync

const DIFF_FILES = 'git status --porcelain | sed s/^...//'
const STAGED_FILES = 'git diff --name-only --cached'
const GIT_FILES = 'git ls-files -c -o --exclude-standard'

const getFiles = (buffer: Buffer): Array<string> =>
  buffer
    .toString()
    .split('\n')
    .map((file: string) => resolve(file))
    .filter((f: string) => existsSync(f) && !lstatSync(f).isDirectory())

export class GitFiles {
  protected files: string[]
  private lastCommand: string
  constructor(command?: string) {
    this.files = getFiles(exec(command || GIT_FILES))
    this.lastCommand = GIT_FILES
  }
  diff() {
    this.files = getFiles(exec(DIFF_FILES))
    this.lastCommand = DIFF_FILES
    return this
  }
  staged() {
    this.files = getFiles(exec(STAGED_FILES))
    this.lastCommand = STAGED_FILES
    return this
  }
  getTSFiles() {
    return getFiles(exec(`${this.lastCommand} | grep \.ts$ || true`))
  }
  getFiles() {
    return this.files
  }
}
