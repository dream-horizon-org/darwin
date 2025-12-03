import * as t from 'io-ts'

export const CheckUniqueProjectInputSchema = t.partial({
  projectName: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  is_unique: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnCheckUniqueProjectSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({is_unique: t.union([t.null, t.literal(false), t.literal(true)])}),
  ]),
})

export const CheckUniqueProjectSchema = t.type({
  checkUniqueProject: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
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
