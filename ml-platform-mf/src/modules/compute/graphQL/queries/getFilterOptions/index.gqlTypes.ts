import * as t from 'io-ts'

export const SelectionOnDataSchema = t.type({
  users: t.array(t.string),
  status: t.array(t.string),
})

export const SelectionOnGetFilterOptionsSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({users: t.array(t.string), status: t.array(t.string)}),
  ]),
})

export const GetFilterOptionsSchema = t.type({
  getFilterOptions: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({users: t.array(t.string), status: t.array(t.string)}),
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
