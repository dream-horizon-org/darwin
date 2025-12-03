import * as t from 'io-ts'

export const ValidateEdgeTableNameInputSchema = t.type({tableName: t.string})

export const SelectionOnDataSchema = t.type({
  tableNameExists: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnValidateEdgeTableNameSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      tableNameExists: t.union([t.null, t.literal(false), t.literal(true)]),
    }),
  ]),
})

export const ValidateEdgeTableNameSchema = t.type({
  validateEdgeTableName: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          tableNameExists: t.union([t.null, t.literal(false), t.literal(true)]),
        }),
      ]),
    }),
  ]),
})

export const GraphQLWrapperSchema = t.type({
  query: t.string,
  name: t.string,
  operation: t.keyof({query: null, mutation: null, subscription: null}),
})

export const GQLSchema = t.type({
  query: t.string,
  name: t.string,
  operation: t.keyof({query: null, mutation: null, subscription: null}),
})
