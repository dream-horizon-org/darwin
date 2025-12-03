import * as t from 'io-ts'

export const GetLogsInputSchema = t.partial({
  clusterId: t.union([t.undefined, t.null, t.string]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
  lastEventId: t.union([t.undefined, t.null, t.number]),
  filters: t.union([
    t.undefined,
    t.null,
    t.partial({
      severities: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.string])),
      ]),
      start_timestamp: t.union([t.undefined, t.null, t.string]),
      end_timestamp: t.union([t.undefined, t.null, t.string]),
      components: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.number])),
      ]),
      event_types: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.string])),
      ]),
    }),
  ]),
})

export const SelectionOnDataSchema = t.type({
  raw_event_id: t.union([t.null, t.number]),
  processed_event_id: t.union([t.null, t.number]),
  timestamp: t.union([t.null, t.string]),
  event_type: t.union([t.null, t.string]),
  message: t.union([t.null, t.string]),
  severity: t.union([t.null, t.string]),
  source_id: t.union([t.null, t.number]),
})

export const SelectionOnGetLogsSchema = t.type({
  status: t.union([t.null, t.string]),
  page_size: t.union([t.null, t.number]),
  offset: t.union([t.null, t.number]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          raw_event_id: t.union([t.null, t.number]),
          processed_event_id: t.union([t.null, t.number]),
          timestamp: t.union([t.null, t.string]),
          event_type: t.union([t.null, t.string]),
          message: t.union([t.null, t.string]),
          severity: t.union([t.null, t.string]),
          source_id: t.union([t.null, t.number]),
        }),
      ])
    ),
  ]),
})

export const GetLogsSchema = t.type({
  getLogs: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      page_size: t.union([t.null, t.number]),
      offset: t.union([t.null, t.number]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              raw_event_id: t.union([t.null, t.number]),
              processed_event_id: t.union([t.null, t.number]),
              timestamp: t.union([t.null, t.string]),
              event_type: t.union([t.null, t.string]),
              message: t.union([t.null, t.string]),
              severity: t.union([t.null, t.string]),
              source_id: t.union([t.null, t.number]),
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
