"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFlags = void 0;
var MAX_FLAG_COUNT = 28;
var values = new Array(MAX_FLAG_COUNT)
    .fill(undefined)
    .map(function (_, i) { return Math.max(1, 2 << (i - 1)); });
function extractFlags(input) {
    var flags = [];
    for (var i = MAX_FLAG_COUNT; i >= 0; i--) {
        if (input >= values[i]) {
            input -= values[i];
            flags.push(values[i]);
        }
        if (input === 0)
            return flags;
    }
    return flags;
}
exports.extractFlags = extractFlags;
