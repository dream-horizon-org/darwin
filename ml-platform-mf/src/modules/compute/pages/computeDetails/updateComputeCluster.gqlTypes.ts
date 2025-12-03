import * as t from 'io-ts'

export const UpdateComputeClusterInputSchema = t.partial({
  input: t.union([
    t.undefined,
    t.null,
    t.partial({
      clusterId: t.union([t.undefined, t.null, t.string]),
      data: t.unknown,
    }),
  ]),
})

export const SelectionOnDataSchema = t.type({
  ClusterName: t.union([t.null, t.string]),
  DashboardLink: t.union([t.null, t.string]),
  JupyterLink: t.union([t.null, t.string]),
})

export const SelectionOnUpdateComputeClusterSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      ClusterName: t.union([t.null, t.string]),
      DashboardLink: t.union([t.null, t.string]),
      JupyterLink: t.union([t.null, t.string]),
    }),
  ]),
})

export const UpdateComputeClusterSchema = t.type({
  updateComputeCluster: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          ClusterName: t.union([t.null, t.string]),
          DashboardLink: t.union([t.null, t.string]),
          JupyterLink: t.union([t.null, t.string]),
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
