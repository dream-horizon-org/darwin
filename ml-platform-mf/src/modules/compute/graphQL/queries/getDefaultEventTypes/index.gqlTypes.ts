import * as t from 'io-ts'

export const SelectionOnGetEventTypesSchema = t.type({data: t.array(t.unknown)})

export const GetDefaultEventTypesSchema = t.type({
  getEventTypes: t.union([t.null, t.type({data: t.array(t.unknown)})]),
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
