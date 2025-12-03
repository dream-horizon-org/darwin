import * as t from 'io-ts'

export const GetLastSyncedTimeForCodespaceInputSchema = t.partial({
  codespaceId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  last_synced_time: t.union([t.null, t.string]),
})

export const SelectionOnGetLastSyncedTimeForCodespaceSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({last_synced_time: t.union([t.null, t.string])}),
  ]),
})

export const GetLastSyncedTimeForCodespaceSchema = t.type({
  getLastSyncedTimeForCodespace: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({last_synced_time: t.union([t.null, t.string])}),
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
