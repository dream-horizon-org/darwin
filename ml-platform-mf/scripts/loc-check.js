"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var MAX_LOC_ALLOWED = 408;
var BASE_BRANCH = process.env.GITHUB_BASE_REF;
// tslint:disable-next-line:no-console
console.log('BASE BRANCH is:', BASE_BRANCH);
var command = "git fetch origin ".concat(BASE_BRANCH, ":base && git diff --numstat base");
var gitOutput = (0, child_process_1.execSync)(command, {
    cwd: process.cwd()
}).toString();
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
var locArr = gitOutput.split('\n');
var TOTAL_LOC = 0;
var regexp = /(.*(.test|.stories|.mock).ts|.*(.lock)|.*(schema)(.json))/g;
/**
 * LOCArr is an Array of lines where each will be as below
 * eg: '2\t2\tsrc/modules/fantasy-team-maker-checker/utils.tsx'
 */
var totalChanges = locArr
    .map(function (line) {
    if (!line.match(regexp) && line.length > 0) {
        var _a = __read(line.split('\t'), 2), additions = _a[0], deletions = _a[1];
        return {
            additions: additions,
            deletions: deletions
        };
    }
})
    .filter(function (item) { return !!item; })
    .map(function (item) {
    return parseInt(item.additions);
})
    .reduce(function (total, changes) {
    return total + changes;
}, 0);
// tslint:disable-next-line:no-console
console.log('Total Lines of change', totalChanges);
if (Math.abs(totalChanges) > MAX_LOC_ALLOWED) {
    // tslint:disable-next-line:no-console
    console.log("Total Lines of change: ".concat(totalChanges, " is greater than ").concat(MAX_LOC_ALLOWED, " , Hence this check failed.\n    Please try to split the PR into smaller ones or reduce the PR size to solve this"));
    process.exit(1);
}
