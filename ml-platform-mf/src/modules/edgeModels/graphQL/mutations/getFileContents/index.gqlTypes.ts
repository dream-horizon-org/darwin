import * as t from 'io-ts'

export const MutationInputSchema = t.type({sourcePath: t.string})

export const SelectionOnGetFileContentsSchema = t.type({
  data: t.unknown,
  message: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
})

export const MutationSchema = t.type({
  getFileContents: t.union([
    t.null,
    t.type({
      data: t.unknown,
      message: t.union([t.null, t.string]),
      status: t.union([t.null, t.string]),
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
