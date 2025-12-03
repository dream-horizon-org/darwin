import * as t from 'io-ts'

export const SelectionOnFetchComputeTagsSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([t.null, t.array(t.union([t.null, t.string]))]),
})

export const FetchComputeTagsSchema = t.type({
  fetchComputeTags: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([t.null, t.array(t.union([t.null, t.string]))]),
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
