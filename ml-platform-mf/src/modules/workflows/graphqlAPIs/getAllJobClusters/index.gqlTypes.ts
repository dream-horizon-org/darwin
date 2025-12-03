import * as t from 'io-ts'

export const GetAllJobClustersV2InputSchema = t.partial({
  query: t.union([t.undefined, t.null, t.string]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
  sortBy: t.union([t.undefined, t.null, t.string]),
  sortOrder: t.union([t.undefined, t.null, t.string]),
  filters: t.union([
    t.undefined,
    t.null,
    t.partial({
      user: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.string])),
      ]),
      exclude_users: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.string])),
      ]),
      status: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.string])),
      ]),
      exclude_clusters: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.string])),
      ]),
    }),
  ]),
})

export const SelectionOnDataSchema = t.type({
  job_cluster_definition_id: t.union([t.null, t.string]),
  cluster_name: t.union([t.null, t.string]),
  cores: t.union([t.null, t.number]),
  memory: t.union([t.null, t.number]),
  runtime: t.union([t.null, t.string]),
  estimated_cost: t.union([t.null, t.string]),
  created_at: t.union([t.null, t.string]),
})

export const SelectionOnGetAllJobClustersV2Schema = t.type({
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          job_cluster_definition_id: t.union([t.null, t.string]),
          cluster_name: t.union([t.null, t.string]),
          cores: t.union([t.null, t.number]),
          memory: t.union([t.null, t.number]),
          runtime: t.union([t.null, t.string]),
          estimated_cost: t.union([t.null, t.string]),
          created_at: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  total_count: t.union([t.null, t.number]),
})

export const GetAllJobClustersV2Schema = t.type({
  getAllJobClustersV2: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              job_cluster_definition_id: t.union([t.null, t.string]),
              cluster_name: t.union([t.null, t.string]),
              cores: t.union([t.null, t.number]),
              memory: t.union([t.null, t.number]),
              runtime: t.union([t.null, t.string]),
              estimated_cost: t.union([t.null, t.string]),
              created_at: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      total_count: t.union([t.null, t.number]),
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
