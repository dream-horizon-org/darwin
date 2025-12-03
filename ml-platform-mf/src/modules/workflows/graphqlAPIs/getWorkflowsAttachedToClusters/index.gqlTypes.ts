import * as t from 'io-ts'

export const GetWorkflowsAttachedToClusterInputSchema = t.type({
  clusterId: t.string,
})

export const SelectionOnGetWorkflowsAttachedToClusterSchema = t.type({
  workflow_name: t.union([t.null, t.string]),
  display_name: t.union([t.null, t.string]),
  description: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
  workflow_id: t.union([t.null, t.string]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  schedule: t.union([t.null, t.string]),
  next_run_time: t.union([t.null, t.string]),
  owner: t.union([t.null, t.string]),
})

export const GetWorkflowsAttachedToClusterSchema = t.type({
  getWorkflowsAttachedToCluster: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          workflow_name: t.union([t.null, t.string]),
          display_name: t.union([t.null, t.string]),
          description: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
          workflow_id: t.union([t.null, t.string]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          schedule: t.union([t.null, t.string]),
          next_run_time: t.union([t.null, t.string]),
          owner: t.union([t.null, t.string]),
        }),
      ])
    ),
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
