import * as t from 'io-ts'

export const GetSparkHistoryServerInputSchema = t.type({resourceId: t.string})

export const SelectionOnDataSchema = t.type({
  server_id: t.union([t.null, t.string]),
  resource: t.union([t.null, t.string]),
  user: t.union([t.null, t.string]),
  ttl: t.union([t.null, t.number]),
  started_at: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
  id: t.union([t.null, t.string]),
  url: t.union([t.null, t.string]),
})

export const SelectionOnGetSparkHistoryServerSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      server_id: t.union([t.null, t.string]),
      resource: t.union([t.null, t.string]),
      user: t.union([t.null, t.string]),
      ttl: t.union([t.null, t.number]),
      started_at: t.union([t.null, t.string]),
      status: t.union([t.null, t.string]),
      id: t.union([t.null, t.string]),
      url: t.union([t.null, t.string]),
    }),
  ]),
  message: t.union([t.null, t.string]),
})

export const GetSparkHistoryServerSchema = t.type({
  getSparkHistoryServer: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          server_id: t.union([t.null, t.string]),
          resource: t.union([t.null, t.string]),
          user: t.union([t.null, t.string]),
          ttl: t.union([t.null, t.number]),
          started_at: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
          id: t.union([t.null, t.string]),
          url: t.union([t.null, t.string]),
        }),
      ]),
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
