import * as t from 'io-ts'

export const GetRuntimeDetailsInputSchema = t.type({runtimeName: t.string})

export const SelectionOnGetRuntimeDetailsSchema = t.type({
  status: t.unknown,
  logs: t.string,
})

export const GetRuntimeDetailsSchema = t.type({
  getRuntimeDetails: t.union([
    t.null,
    t.type({status: t.unknown, logs: t.string}),
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
