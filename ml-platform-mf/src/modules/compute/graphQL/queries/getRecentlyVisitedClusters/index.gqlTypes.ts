import * as t from 'io-ts'

export const SelectionOnDataSchema = t.type({
  cluster_id: t.union([t.null, t.string]),
  cluster_name: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
  total_cores: t.union([t.null, t.number]),
  total_memory: t.union([t.null, t.number]),
  last_visited: t.union([t.null, t.string]),
})

export const SelectionOnGetRecentlyVisitedClustersSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.array(
    t.type({
      cluster_id: t.union([t.null, t.string]),
      cluster_name: t.union([t.null, t.string]),
      status: t.union([t.null, t.string]),
      total_cores: t.union([t.null, t.number]),
      total_memory: t.union([t.null, t.number]),
      last_visited: t.union([t.null, t.string]),
    })
  ),
})

export const GetRecentlyVisitedClustersSchema = t.type({
  getRecentlyVisitedClusters: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.array(
        t.type({
          cluster_id: t.union([t.null, t.string]),
          cluster_name: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
          total_cores: t.union([t.null, t.number]),
          total_memory: t.union([t.null, t.number]),
          last_visited: t.union([t.null, t.string]),
        })
      ),
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
