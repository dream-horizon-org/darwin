import * as t from 'io-ts'

export const CheckUniqueJobClusterNameInputSchema = t.partial({
  clusterName: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  is_unique: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnCheckUniqueJobClusterNameSchema = t.type({
  data: t.union([
    t.null,
    t.type({is_unique: t.union([t.null, t.literal(false), t.literal(true)])}),
  ]),
})

export const CheckUniqueJobClusterNameSchema = t.type({
  checkUniqueJobClusterName: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          is_unique: t.union([t.null, t.literal(false), t.literal(true)]),
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
