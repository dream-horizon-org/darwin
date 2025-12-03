import * as t from 'io-ts'

export const SelectionOnDataSchema = t.type({
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  owners: t.union([t.null, t.array(t.union([t.null, t.string]))]),
})

export const SelectionOnFetchAllFiltersSchema = t.type({
  message: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
      owners: t.union([t.null, t.array(t.union([t.null, t.string]))]),
    }),
  ]),
})

export const FetchAllFiltersSchema = t.type({
  fetchAllFilters: t.union([
    t.null,
    t.type({
      message: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          owners: t.union([t.null, t.array(t.union([t.null, t.string]))]),
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
