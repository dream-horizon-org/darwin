import * as t from 'io-ts'

export const GetFeatureGroupsCountInputSchema = t.partial({
  searchString: t.union([t.undefined, t.null, t.string]),
  filters: t.union([
    t.undefined,
    t.null,
    t.array(
      t.union([
        t.null,
        t.partial({
          name: t.union([t.undefined, t.null, t.string]),
          value: t.union([
            t.undefined,
            t.null,
            t.array(t.union([t.null, t.string])),
          ]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnDataSchema = t.type({
  offlineCount: t.union([t.null, t.number]),
  onlineCount: t.union([t.null, t.number]),
})

export const SelectionOnGetFeatureGroupsCountSchema = t.type({
  status: t.union([t.null, t.string]),
  statusCode: t.union([t.null, t.number]),
  data: t.union([
    t.null,
    t.type({
      offlineCount: t.union([t.null, t.number]),
      onlineCount: t.union([t.null, t.number]),
    }),
  ]),
})

export const GetFeatureGroupsCountSchema = t.type({
  getFeatureGroupsCount: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      statusCode: t.union([t.null, t.number]),
      data: t.union([
        t.null,
        t.type({
          offlineCount: t.union([t.null, t.number]),
          onlineCount: t.union([t.null, t.number]),
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
