import * as t from 'io-ts'

export const GetActionGroupDetailsInputSchema = t.partial({
  clusterRuntimeId: t.union([t.undefined, t.null, t.string]),
  sortOrder: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  timestamp: t.union([t.null, t.string]),
  event_name: t.union([t.null, t.string]),
  event_description: t.union([t.null, t.string]),
})

export const SelectionOnGetActionGroupDetailsSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          timestamp: t.union([t.null, t.string]),
          event_name: t.union([t.null, t.string]),
          event_description: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const GetActionGroupDetailsSchema = t.type({
  getActionGroupDetails: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              timestamp: t.union([t.null, t.string]),
              event_name: t.union([t.null, t.string]),
              event_description: t.union([t.null, t.string]),
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
