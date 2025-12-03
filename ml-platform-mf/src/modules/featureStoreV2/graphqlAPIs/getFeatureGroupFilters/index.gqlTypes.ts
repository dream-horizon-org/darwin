import * as t from 'io-ts'

export const GetFeatureGroupFiltersInputSchema = t.partial({
  user: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  name: t.union([t.null, t.string]),
  value: t.union([t.null, t.array(t.union([t.null, t.string]))]),
})

export const SelectionOnGetFeatureGroupFiltersSchema = t.type({
  status: t.unknown,
  statusCode: t.union([t.null, t.number]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          value: t.union([t.null, t.array(t.union([t.null, t.string]))]),
        }),
      ])
    ),
  ]),
})

export const GetFeatureGroupFiltersSchema = t.type({
  getFeatureGroupFilters: t.union([
    t.null,
    t.type({
      status: t.unknown,
      statusCode: t.union([t.null, t.number]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              name: t.union([t.null, t.string]),
              value: t.union([t.null, t.array(t.union([t.null, t.string]))]),
            }),
          ])
        ),
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
