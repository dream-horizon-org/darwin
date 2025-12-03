import * as t from 'io-ts'

export const SelectionOnDataSchema = t.type({
  status: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  users: t.union([t.null, t.array(t.union([t.null, t.string]))]),
})

export const SelectionOnGetWorkflowFiltersSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.array(t.union([t.null, t.string]))]),
      users: t.union([t.null, t.array(t.union([t.null, t.string]))]),
    }),
  ]),
})

export const GetWorkflowFiltersSchema = t.type({
  getWorkflowFilters: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          status: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          users: t.union([t.null, t.array(t.union([t.null, t.string]))]),
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
