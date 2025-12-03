import * as t from 'io-ts'

export const GetDataSourceSourcesForEnvironmentInputSchema = t.partial({
  env: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnGetDataSourceSourcesForEnvironmentSchema = t.type({
  data: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  message: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
})

export const GetDataSourceSourcesForEnvironmentSchema = t.type({
  getDataSourceSourcesForEnvironment: t.union([
    t.null,
    t.type({
      data: t.union([t.null, t.array(t.union([t.null, t.string]))]),
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
