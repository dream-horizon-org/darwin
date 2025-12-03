import * as t from 'io-ts'

export const StopClusterInputSchema = t.partial({
  input: t.union([
    t.undefined,
    t.null,
    t.partial({cluster_id: t.union([t.undefined, t.null, t.string])}),
  ]),
})

export const SelectionOnDataSchema = t.type({
  cluster_id: t.union([t.null, t.string]),
})

export const SelectionOnStopClusterSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([t.null, t.type({cluster_id: t.union([t.null, t.string])})]),
})

export const StopClusterSchema = t.type({
  stopCluster: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({cluster_id: t.union([t.null, t.string])}),
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
