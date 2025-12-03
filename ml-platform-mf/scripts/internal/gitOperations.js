"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitFiles = void 0;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var path_1 = require("path");
var exec = child_process_1.execSync;
var DIFF_FILES = 'git status --porcelain | sed s/^...//';
var STAGED_FILES = 'git diff --name-only --cached';
var GIT_FILES = 'git ls-files -c -o --exclude-standard';
var getFiles = function (buffer) {
    return buffer
        .toString()
        .split('\n')
        .map(function (file) { return (0, path_1.resolve)(file); })
        .filter(function (f) { return (0, fs_1.existsSync)(f) && !(0, fs_1.lstatSync)(f).isDirectory(); });
};
var GitFiles = /** @class */ (function () {
    function GitFiles(command) {
        this.files = getFiles(exec(command || GIT_FILES));
        this.lastCommand = GIT_FILES;
    }
    GitFiles.prototype.diff = function () {
        this.files = getFiles(exec(DIFF_FILES));
        this.lastCommand = DIFF_FILES;
        return this;
    };
    GitFiles.prototype.staged = function () {
        this.files = getFiles(exec(STAGED_FILES));
        this.lastCommand = STAGED_FILES;
        return this;
    };
    GitFiles.prototype.getTSFiles = function () {
        return getFiles(exec("".concat(this.lastCommand, " | grep .ts$ || true")));
    };
    GitFiles.prototype.getFiles = function () {
        return this.files;
    };
    return GitFiles;
}());
exports.GitFiles = GitFiles;
