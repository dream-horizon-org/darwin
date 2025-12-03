"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidatorsFromString = exports.DEFAULT_FILE_NAME = void 0;
var ts = require("typescript");
var flags_1 = require("./flags");
var types_1 = require("./types");
exports.DEFAULT_FILE_NAME = 'io-to-ts.ts';
var getImports = function () {
    return "import * as t from 'io-ts'";
};
var compilerOptions = {
    strictNullChecks: true
};
var processProperty = function (checker) { return function (s) {
    return "".concat(s.name, ": ").concat(processType(checker)(checker.getTypeOfSymbolAtLocation(s, s.valueDeclaration)));
}; };
var getOptimizedStringLiteralUnion = function (type) {
    var unionTypes = type.types;
    return "t.keyof({".concat(unionTypes
        .map(function (t) { return "'".concat(t.value, "': null"); })
        .join(', '), "})");
};
var processObjectType = function (checker) { return function (type) {
    var properties = checker.getPropertiesOfType(type);
    var requiredProperties = properties.filter(function (p) { return !p.valueDeclaration.questionToken; });
    var optionalProperties = properties.filter(function (p) { return p.valueDeclaration.questionToken; });
    if (requiredProperties.length && optionalProperties.length) {
        return "t.intersection([t.type({".concat(requiredProperties.map(processProperty(checker)), "}), t.partial({").concat(optionalProperties
            .map(processProperty(checker))
            .join(', '), "})])");
    }
    else if (optionalProperties.length === 0) {
        return "t.type({".concat(requiredProperties
            .map(processProperty(checker))
            .join(', '), "})");
    }
    else {
        return "t.partial({".concat(optionalProperties
            .map(processProperty(checker))
            .join(', '), "})");
    }
}; };
var processType = function (checker) {
    return function (type) {
        if ((0, types_1.isLiteralType)(type)) {
            return 't.literal(' + checker.typeToString(type) + ')';
        }
        else if ((0, types_1.isPrimitiveType)(type)) {
            return 't.' + checker.typeToString(type);
        }
        else if ((0, types_1.isBasicObjectType)(type, checker)) {
            return "t.type({})";
        }
        else if (type.isUnion()) {
            var isStringLiteralUnion = type.types.every(function (t) { return t.isStringLiteral(); });
            if (isStringLiteralUnion) {
                return getOptimizedStringLiteralUnion(type);
            }
            return "t.union([".concat(type.types.map(processType(checker)).join(', '), "])");
        }
        else if (type.isIntersection()) {
            return "t.intersection([".concat(type.types
                .map(processType(checker))
                .join(', '), "])");
        }
        else if ((0, types_1.isTupleType)(type)) {
            if (type.hasRestElement) {
                // tslint:disable-next-line:no-console
                console.warn('io-ts default validators do not support rest parameters in a tuple');
            }
            return "t.tuple([".concat(type.typeArguments.map(processType(checker)), "])");
        }
        else if ((0, types_1.isArrayType)(type)) {
            return "t.array(".concat(processType(checker)(type.getNumberIndexType()), ")");
        }
        else if ((0, types_1.isRecordType)(type)) {
            var _a = type.aliasTypeArguments, key = _a[0], value = _a[1];
            return "t.record(".concat(processType(checker)(key), ", ").concat(processType(checker)(value), ")");
        }
        else if ((0, types_1.isStringIndexedObjectType)(type)) {
            return "t.record(t.string, ".concat(processType(checker)(type.getStringIndexType()), ")");
        }
        else if ((0, types_1.isNumberIndexedType)(type)) {
            return "t.record(t.number, ".concat(processType(checker)(type.getNumberIndexType()), ")");
        }
        else if ((0, types_1.isFunctionType)(type)) {
            return "t.Function";
        }
        else if ((0, types_1.isObjectType)(type)) {
            return processObjectType(checker)(type);
        }
        else if ((0, types_1.isVoid)(type)) {
            return 't.void';
        }
        else if ((0, types_1.isAnyOrUnknown)(type)) {
            return 't.unknown';
        }
        throw Error('Unknown type with type flags: ' + (0, flags_1.extractFlags)(type.flags));
    };
};
function handleDeclaration(node, checker) {
    var symbol, type;
    try {
        if (node.kind === ts.SyntaxKind.VariableStatement) {
            symbol = checker.getSymbolAtLocation(node.declarationList.declarations[0].name);
            type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
        }
        else {
            symbol = checker.getSymbolAtLocation(node.name);
            type = checker.getTypeAtLocation(node);
        }
        return "export const ".concat(symbol.name, "Schema = ") + processType(checker)(type);
    }
    catch (e) {
        return "// Error: Failed to generate a codec for ".concat(symbol ? symbol.name : '');
    }
}
var visit = function (checker, result) { return function (node) {
    if (ts.isTypeAliasDeclaration(node) ||
        ts.isVariableStatement(node) ||
        ts.isInterfaceDeclaration(node)) {
        result.push(handleDeclaration(node, checker));
    }
    else if (ts.isModuleDeclaration(node)) {
        ts.forEachChild(node, visit(checker, result));
    }
}; };
function getValidatorsFromString(source) {
    var defaultCompilerHostOptions = ts.createCompilerHost({});
    var compilerHostOptions = __assign(__assign({}, defaultCompilerHostOptions), { getSourceFile: function (filename, languageVersion) {
            var restArgs = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                restArgs[_i - 2] = arguments[_i];
            }
            if (filename === exports.DEFAULT_FILE_NAME)
                return ts.createSourceFile(filename, source, ts.ScriptTarget.ES2015, true);
            else
                return defaultCompilerHostOptions.getSourceFile.apply(defaultCompilerHostOptions, __spreadArray([filename,
                    languageVersion], restArgs, false));
        } });
    var program = ts.createProgram([exports.DEFAULT_FILE_NAME], compilerOptions, compilerHostOptions);
    var checker = program.getTypeChecker();
    var result = [getImports()];
    ts.forEachChild(program.getSourceFile(exports.DEFAULT_FILE_NAME), visit(checker, result));
    return result.join('\n\n');
}
exports.getValidatorsFromString = getValidatorsFromString;
