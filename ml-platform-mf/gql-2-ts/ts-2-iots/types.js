"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLiteralType = exports.isBasicObjectType = exports.isFunctionType = exports.isArrayType = exports.isNumberIndexedType = exports.isStringIndexedObjectType = exports.isRecordType = exports.isTupleType = exports.isVoid = exports.isAnyOrUnknown = exports.isPrimitiveType = exports.isObjectType = void 0;
var ts = require("typescript");
var flags_1 = require("./flags");
function isObjectType(type) {
    return (0, flags_1.extractFlags)(type.flags).includes(ts.TypeFlags.Object);
}
exports.isObjectType = isObjectType;
function isPrimitiveType(type) {
    return (0, flags_1.extractFlags)(type.flags).some(function (flag) {
        return [
            ts.TypeFlags.String,
            ts.TypeFlags.Number,
            ts.TypeFlags.Boolean,
            ts.TypeFlags.Null,
            ts.TypeFlags.Undefined
        ].includes(flag);
    });
}
exports.isPrimitiveType = isPrimitiveType;
function isAnyOrUnknown(type) {
    return (0, flags_1.extractFlags)(type.flags).some(function (f) {
        return [ts.TypeFlags.Any, ts.TypeFlags.Unknown].includes(f);
    });
}
exports.isAnyOrUnknown = isAnyOrUnknown;
function isVoid(type) {
    return (0, flags_1.extractFlags)(type.flags).includes(ts.TypeFlags.Void);
}
exports.isVoid = isVoid;
function isTupleType(type) {
    var _a;
    return (typeof ((_a = type.target) === null || _a === void 0 ? void 0 : _a.hasRestElement) === 'boolean');
}
exports.isTupleType = isTupleType;
function isRecordType(type) {
    return type.aliasSymbol && type.aliasSymbol.escapedName === 'Record';
}
exports.isRecordType = isRecordType;
function isStringIndexedObjectType(type) {
    return type.getStringIndexType();
}
exports.isStringIndexedObjectType = isStringIndexedObjectType;
function isNumberIndexedType(type) {
    return type.getNumberIndexType();
}
exports.isNumberIndexedType = isNumberIndexedType;
function isArrayType(type) {
    return type.symbol && type.symbol.escapedName === 'Array';
}
exports.isArrayType = isArrayType;
function isFunctionType(type) {
    return !!type.getCallSignatures().length;
}
exports.isFunctionType = isFunctionType;
function isBasicObjectType(type, checker) {
    return checker.typeToString(type) === 'object';
}
exports.isBasicObjectType = isBasicObjectType;
function isLiteralType(type) {
    return (0, flags_1.extractFlags)(type.flags).some(function (f) {
        return [
            ts.TypeFlags.StringLiteral,
            ts.TypeFlags.NumberLiteral,
            ts.TypeFlags.BooleanLiteral
        ].includes(f);
    });
}
exports.isLiteralType = isLiteralType;
