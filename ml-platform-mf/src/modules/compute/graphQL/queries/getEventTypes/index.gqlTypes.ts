import * as t from 'io-ts'

export const SelectionOnDataSchema = t.type({
  event: t.string,
  default: t.boolean,
})

export const SelectionOnGetEventTypesSchema = t.type({
  data: t.array(t.type({event: t.string, default: t.boolean})),
})

export const GetEventTypesSchema = t.type({
  getEventTypes: t.union([
    t.null,
    t.type({data: t.array(t.type({event: t.string, default: t.boolean}))}),
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
