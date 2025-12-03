import * as t from 'io-ts'

export const DeleteJobClusterDefinitionInputSchema = t.partial({
  input: t.union([
    t.undefined,
    t.null,
    t.partial({cluster_id: t.union([t.undefined, t.null, t.string])}),
  ]),
})

export const SelectionOnDataSchema = t.type({
  is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
  job_cluster_id: t.union([t.null, t.string]),
})

export const SelectionOnDeleteJobClusterDefinitionSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
      job_cluster_id: t.union([t.null, t.string]),
    }),
  ]),
})

export const DeleteJobClusterDefinitionSchema = t.type({
  deleteJobClusterDefinition: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
          job_cluster_id: t.union([t.null, t.string]),
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
