import * as ts from 'typescript'
import {extractFlags} from './flags'
import {
  isAnyOrUnknown,
  isArrayType,
  isBasicObjectType,
  isFunctionType,
  isLiteralType,
  isNumberIndexedType,
  isObjectType,
  isPrimitiveType,
  isRecordType,
  isStringIndexedObjectType,
  isTupleType,
  isVoid
} from './types'

export const DEFAULT_FILE_NAME = 'io-to-ts.ts'

const getImports = () => {
  return `import * as t from 'io-ts'`
}

const compilerOptions: ts.CompilerOptions = {
  strictNullChecks: true
}

const processProperty = (checker: ts.TypeChecker) => (s: ts.Symbol) => {
  return `${s.name}: ${processType(checker)(
    checker.getTypeOfSymbolAtLocation(s, s.valueDeclaration)
  )}`
}

const getOptimizedStringLiteralUnion = (type: ts.UnionType) => {
  const unionTypes = type.types as ts.StringLiteralType[]
  return `t.keyof({${unionTypes
    .map((t: ts.StringLiteralType) => `'${t.value}': null`)
    .join(', ')}})`
}

const processObjectType =
  (checker: ts.TypeChecker) => (type: ts.ObjectType) => {
    const properties = checker.getPropertiesOfType(type)
    const requiredProperties = properties.filter(
      (p) => !(p.valueDeclaration as ts.ParameterDeclaration).questionToken
    )
    const optionalProperties = properties.filter(
      (p) => (p.valueDeclaration as ts.ParameterDeclaration).questionToken
    )
    if (requiredProperties.length && optionalProperties.length) {
      return `t.intersection([t.type({${requiredProperties.map(
        processProperty(checker)
      )}}), t.partial({${optionalProperties
        .map(processProperty(checker))
        .join(', ')}})])`
    } else if (optionalProperties.length === 0) {
      return `t.type({${requiredProperties
        .map(processProperty(checker))
        .join(', ')}})`
    } else {
      return `t.partial({${optionalProperties
        .map(processProperty(checker))
        .join(', ')}})`
    }
  }

const processType =
  (checker: ts.TypeChecker) =>
  (type: ts.Type): string => {
    if (isLiteralType(type)) {
      return 't.literal(' + checker.typeToString(type) + ')'
    } else if (isPrimitiveType(type)) {
      return 't.' + checker.typeToString(type)
    } else if (isBasicObjectType(type, checker)) {
      return `t.type({})`
    } else if (type.isUnion()) {
      const isStringLiteralUnion = type.types.every((t) => t.isStringLiteral())
      if (isStringLiteralUnion) {
        return getOptimizedStringLiteralUnion(type)
      }
      return `t.union([${type.types.map(processType(checker)).join(', ')}])`
    } else if (type.isIntersection()) {
      return `t.intersection([${type.types
        .map(processType(checker))
        .join(', ')}])`
    } else if (isTupleType(type)) {
      if (type.hasRestElement) {
        // tslint:disable-next-line:no-console
        console.warn(
          'io-ts default validators do not support rest parameters in a tuple'
        )
      }
      return `t.tuple([${(type as ts.TupleType).typeArguments!.map(
        processType(checker)
      )}])`
    } else if (isArrayType(type)) {
      return `t.array(${processType(checker)(type.getNumberIndexType()!)})`
    } else if (isRecordType(type)) {
      const [key, value] = type.aliasTypeArguments!
      return `t.record(${processType(checker)(key)}, ${processType(checker)(
        value
      )})`
    } else if (isStringIndexedObjectType(type)) {
      return `t.record(t.string, ${processType(checker)(
        type.getStringIndexType()!
      )})`
    } else if (isNumberIndexedType(type)) {
      return `t.record(t.number, ${processType(checker)(
        type.getNumberIndexType()!
      )})`
    } else if (isFunctionType(type)) {
      return `t.Function`
    } else if (isObjectType(type)) {
      return processObjectType(checker)(type)
    } else if (isVoid(type)) {
      return 't.void'
    } else if (isAnyOrUnknown(type)) {
      return 't.unknown'
    }
    throw Error('Unknown type with type flags: ' + extractFlags(type.flags))
  }

function handleDeclaration(
  node:
    | ts.TypeAliasDeclaration
    | ts.InterfaceDeclaration
    | ts.VariableStatement,
  checker: ts.TypeChecker
) {
  let symbol, type
  try {
    if (node.kind === ts.SyntaxKind.VariableStatement) {
      symbol = checker.getSymbolAtLocation(
        node.declarationList.declarations[0].name
      )
      type = checker.getTypeOfSymbolAtLocation(
        symbol!,
        symbol!.valueDeclaration!
      )
    } else {
      symbol = checker.getSymbolAtLocation(node.name)
      type = checker.getTypeAtLocation(node)
    }
    return `export const ${symbol!.name}Schema = ` + processType(checker)(type)
  } catch (e) {
    return `// Error: Failed to generate a codec for ${
      symbol ? symbol.name : ''
    }`
  }
}

const visit =
  (checker: ts.TypeChecker, result: string[]) => (node: ts.Node) => {
    if (
      ts.isTypeAliasDeclaration(node) ||
      ts.isVariableStatement(node) ||
      ts.isInterfaceDeclaration(node)
    ) {
      result.push(handleDeclaration(node, checker))
    } else if (ts.isModuleDeclaration(node)) {
      ts.forEachChild(node, visit(checker, result))
    }
  }

export function getValidatorsFromString(source: string) {
  const defaultCompilerHostOptions = ts.createCompilerHost({})

  const compilerHostOptions = {
    ...defaultCompilerHostOptions,
    getSourceFile: (
      filename: string,
      languageVersion: ts.ScriptTarget,
      ...restArgs: any[]
    ) => {
      if (filename === DEFAULT_FILE_NAME)
        return ts.createSourceFile(
          filename,
          source,
          ts.ScriptTarget.ES2015,
          true
        )
      else
        return defaultCompilerHostOptions.getSourceFile(
          filename,
          languageVersion,
          ...restArgs
        )
    }
  }

  const program = ts.createProgram(
    [DEFAULT_FILE_NAME],
    compilerOptions,
    compilerHostOptions
  )
  const checker = program.getTypeChecker()
  const result = [getImports()]
  ts.forEachChild(
    program.getSourceFile(DEFAULT_FILE_NAME)!,
    visit(checker, result)
  )
  return result.join('\n\n')
}
