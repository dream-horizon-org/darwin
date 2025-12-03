import * as t from 'io-ts'

export const GetActionGroupsInputSchema = t.partial({
  clusterId: t.union([t.undefined, t.null, t.string]),
  offset: t.union([t.undefined, t.null, t.number]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  sortOrder: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnFirstEventSchema = t.type({
  timestamp: t.union([t.null, t.string]),
  event_name: t.union([t.null, t.string]),
  event_description: t.union([t.null, t.string]),
})

export const SelectionOnLastEventSchema = t.type({
  timestamp: t.union([t.null, t.string]),
  event_name: t.union([t.null, t.string]),
  event_description: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  cluster_runtime_id: t.union([t.null, t.string]),
  count_of_events: t.union([t.null, t.number]),
  first_event: t.union([
    t.null,
    t.type({
      timestamp: t.union([t.null, t.string]),
      event_name: t.union([t.null, t.string]),
      event_description: t.union([t.null, t.string]),
    }),
  ]),
  last_event: t.union([
    t.null,
    t.type({
      timestamp: t.union([t.null, t.string]),
      event_name: t.union([t.null, t.string]),
      event_description: t.union([t.null, t.string]),
    }),
  ]),
})

export const SelectionOnGetActionGroupsSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          cluster_runtime_id: t.union([t.null, t.string]),
          count_of_events: t.union([t.null, t.number]),
          first_event: t.union([
            t.null,
            t.type({
              timestamp: t.union([t.null, t.string]),
              event_name: t.union([t.null, t.string]),
              event_description: t.union([t.null, t.string]),
            }),
          ]),
          last_event: t.union([
            t.null,
            t.type({
              timestamp: t.union([t.null, t.string]),
              event_name: t.union([t.null, t.string]),
              event_description: t.union([t.null, t.string]),
            }),
          ]),
        }),
      ])
    ),
  ]),
})

export const GetActionGroupsSchema = t.type({
  getActionGroups: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              cluster_runtime_id: t.union([t.null, t.string]),
              count_of_events: t.union([t.null, t.number]),
              first_event: t.union([
                t.null,
                t.type({
                  timestamp: t.union([t.null, t.string]),
                  event_name: t.union([t.null, t.string]),
                  event_description: t.union([t.null, t.string]),
                }),
              ]),
              last_event: t.union([
                t.null,
                t.type({
                  timestamp: t.union([t.null, t.string]),
                  event_name: t.union([t.null, t.string]),
                  event_description: t.union([t.null, t.string]),
                }),
              ]),
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
