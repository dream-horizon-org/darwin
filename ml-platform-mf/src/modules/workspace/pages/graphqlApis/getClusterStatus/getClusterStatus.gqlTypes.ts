import * as t from 'io-ts'

export const GetComputeClusterInputSchema = t.partial({
  clusterId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  clusterId: t.union([t.null, t.string]),
  clusterName: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
})

export const SelectionOnGetComputeClusterSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      clusterId: t.union([t.null, t.string]),
      clusterName: t.union([t.null, t.string]),
      status: t.union([t.null, t.string]),
    }),
  ]),
})

export const GetComputeClusterSchema = t.type({
  getComputeCluster: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          clusterId: t.union([t.null, t.string]),
          clusterName: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
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
