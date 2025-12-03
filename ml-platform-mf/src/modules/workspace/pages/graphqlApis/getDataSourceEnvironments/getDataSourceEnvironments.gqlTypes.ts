import * as t from 'io-ts'

export const SelectionOnGetDataSourceEnvironmentsSchema = t.type({
  data: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  message: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
})

export const GetDataSourceEnvironmentsSchema = t.type({
  getDataSourceEnvironments: t.union([
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
