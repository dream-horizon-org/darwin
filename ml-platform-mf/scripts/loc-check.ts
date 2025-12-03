import {execSync} from 'child_process'

const MAX_LOC_ALLOWED = 408
const BASE_BRANCH = process.env.GITHUB_BASE_REF
// tslint:disable-next-line:no-console
console.log('BASE BRANCH is:', BASE_BRANCH)
const command = `git fetch origin ${BASE_BRANCH}:base && git diff --numstat base`
const gitOutput = execSync(command, {
  cwd: process.cwd()
}).toString()

/**
 * Example of the output for the above gitCommand is as below
4       2       src/component-utils/CustomTooltip/CustomGQLTooltip.tsx
6       6       src/component-utils/rule-json/ruleJson.constants.ts
0       8       src/component-utils/rule-json/ruleJson.tsx
1       1       src/modules/fantasy-team-maker-checker/customToolTip.test.tsx
6       5       src/modules/fantasy-team-maker-checker/{SquadMakerCheckerToolTip.tsx => customToolTip.tsx}
2       2       src/modules/fantasy-team-maker-checker/utils.tsx
1       1       src/modules/fantasy-tour-form/fantasyTourForm.test.tsx
1       1       src/modules/tour-form/AddTourForm.test.tsx
2       6       src/modules/umbrellas/umbrellasObj.tsx
0       131     src/modules/user-search-activity-logs/duck/ActivityLogs.thunk.test.ts
2       35      src/modules/user-search-activity-logs/internals/ActivityLogs.utils.test.ts
 */

const locArr = gitOutput.split('\n')
let TOTAL_LOC = 0
const regexp = /(.*(.test|.stories|.mock).ts|.*(.lock)|.*(schema)(.json))/g

/**
 * LOCArr is an Array of lines where each will be as below
 * eg: '2\t2\tsrc/modules/fantasy-team-maker-checker/utils.tsx'
 */

const totalChanges = locArr
  .map((line) => {
    if (!line.match(regexp) && line.length > 0) {
      const [additions, deletions] = line.split('\t')
      return {
        additions,
        deletions
      }
    }
  })
  .filter((item) => !!item)
  .map((item) => {
    return parseInt(item.additions)
  })
  .reduce((total, changes) => {
    return total + changes
  }, 0)

// tslint:disable-next-line:no-console
console.log('Total Lines of change', totalChanges)
if (Math.abs(totalChanges) > MAX_LOC_ALLOWED) {
  // tslint:disable-next-line:no-console
  console.log(
    `Total Lines of change: ${totalChanges} is greater than ${MAX_LOC_ALLOWED} , Hence this check failed.
    Please try to split the PR into smaller ones or reduce the PR size to solve this`
  )
  process.exit(1)
}
