"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var sloc_1 = __importDefault(require("sloc"));
var util_1 = require("util");
var gitOperations_1 = require("./internal/gitOperations");
var fs = require('fs');
var readFile = (0, util_1.promisify)(fs.readFile);
var extensions = {
    ts: { pattern: '.*.(ts)$', excludes: ['.*.(test|bm).ts$'], fileType: 'ts' },
    tsx: { pattern: '.*.(tsx)$', excludes: ['.*.(test|bm).tsx$'], fileType: 'tsx' },
    json: { pattern: '.*.(json)$', excludes: [], fileType: 'js' },
    tests: { pattern: '.*.(test.ts)$', excludes: [], fileType: 'ts' },
    benchmarks: { pattern: '.*.(bm.ts)$', excludes: [], fileType: 'ts' }
};
var locInfo = {};
var getSLOCInfo = function () { return __awaiter(void 0, void 0, void 0, function () {
    var git, gitFiles, _loop_1, _a, _b, _i, extension, total;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                git = new gitOperations_1.GitFiles();
                gitFiles = git.getFiles();
                _loop_1 = function (extension) {
                    var excludePattern, files_1, readQueue;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                excludePattern = extensions[extension].excludes;
                                files_1 = gitFiles
                                    .filter(function (file) { return file.match(extensions[extension].pattern); })
                                    .filter(function (file) {
                                    return !excludePattern.reduce(function (acc, excPattern) { return acc || !!file.match(excPattern); }, false);
                                });
                                readQueue = [];
                                files_1.forEach(function (file) {
                                    readQueue.push(readFile(file, 'utf8'));
                                });
                                locInfo[extension] = {
                                    sloc: 0,
                                    numOfFiles: files_1.length,
                                    todo: 0
                                };
                                return [4 /*yield*/, Promise.all(readQueue)
                                        .then(function (files) {
                                        files.forEach(function (file) {
                                            var stats = (0, sloc_1.default)(file, extensions[extension].fileType);
                                            locInfo[extension].sloc = locInfo[extension].sloc + stats.source;
                                            locInfo[extension].todo = locInfo[extension].todo + stats.todo;
                                        });
                                    })
                                        .catch(console.error)]; // tslint:disable-line
                            case 1:
                                _d.sent(); // tslint:disable-line
                                return [2 /*return*/];
                        }
                    });
                };
                _a = [];
                for (_b in extensions)
                    _a.push(_b);
                _i = 0;
                _c.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 4];
                extension = _a[_i];
                return [5 /*yield**/, _loop_1(extension)];
            case 2:
                _c.sent();
                _c.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4:
                total = Object.keys(locInfo).reduce(function (total, extension) {
                    var filesInfo = locInfo[extension];
                    total = total + filesInfo.sloc;
                    return total;
                }, 0);
                locInfo['total'] = {
                    sloc: total
                };
                return [2 /*return*/];
        }
    });
}); };
getSLOCInfo()
    .then(function () {
    console.log(locInfo); // tslint:disable-line
})
    .catch(console.error); // tslint:disable-line
