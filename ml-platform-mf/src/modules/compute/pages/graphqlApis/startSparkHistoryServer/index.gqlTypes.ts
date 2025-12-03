import * as t from 'io-ts'

export const StartSparkHistoryServerInputSchema = t.partial({
  resource: t.union([t.undefined, t.null, t.string]),
  ttl: t.union([t.undefined, t.null, t.number]),
})

export const SelectionOnDataSchema = t.type({
  server_id: t.union([t.null, t.string]),
})

export const SelectionOnStartSparkHistoryServerSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([t.null, t.type({server_id: t.union([t.null, t.string])})]),
  message: t.union([t.null, t.string]),
})

export const StartSparkHistoryServerSchema = t.type({
  startSparkHistoryServer: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([t.null, t.type({server_id: t.union([t.null, t.string])})]),
      message: t.union([t.null, t.string]),
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
