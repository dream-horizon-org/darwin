import * as t from 'io-ts'

export const GetLogLineDetailsInputSchema = t.partial({
  processedEventId: t.union([t.undefined, t.null, t.number]),
})

export const SelectionOnDataSchema = t.type({
  processed_event_id: t.union([t.null, t.number]),
  event_data: t.unknown,
  timestamp: t.union([t.null, t.string]),
})

export const SelectionOnGetLogLineDetailsSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      processed_event_id: t.union([t.null, t.number]),
      event_data: t.unknown,
      timestamp: t.union([t.null, t.string]),
    }),
  ]),
})

export const GetLogLineDetailsSchema = t.type({
  getLogLineDetails: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          processed_event_id: t.union([t.null, t.number]),
          event_data: t.unknown,
          timestamp: t.union([t.null, t.string]),
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
