import * as t from 'io-ts'

export const GetUserClustersInputSchema = t.intersection([
  t.type({
    query: t.string,
    sortBy: t.string,
    sortOrder: t.string,
    pageSize: t.number,
    offset: t.number,
  }),
  t.partial({
    filters: t.union([
      t.undefined,
      t.null,
      t.partial({
        status: t.union([t.undefined, t.array(t.string)]),
        user: t.union([t.undefined, t.array(t.string)]),
      }),
    ]),
  }),
])

export const SelectionOnCoresSchema = t.type({
  total: t.union([t.null, t.number]),
  consumed: t.union([t.null, t.number]),
})

export const SelectionOnMemorySchema = t.type({
  consumed: t.union([t.null, t.number]),
  total: t.union([t.null, t.number]),
})

export const SelectionOnDataSchema = t.type({
  cluster_id: t.union([t.null, t.string]),
  cluster_name: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
  codespaces: t.union([t.null, t.number]),
  runtime: t.union([t.null, t.string]),
  cores: t.union([
    t.null,
    t.type({
      total: t.union([t.null, t.number]),
      consumed: t.union([t.null, t.number]),
    }),
  ]),
  memory: t.union([
    t.null,
    t.type({
      consumed: t.union([t.null, t.number]),
      total: t.union([t.null, t.number]),
    }),
  ]),
  cost: t.union([t.null, t.number]),
})

export const SelectionOnGetSearchedClustersSchema = t.type({
  status: t.union([t.null, t.string]),
  result_size: t.union([t.null, t.number]),
  page_size: t.union([t.null, t.number]),
  offset: t.union([t.null, t.number]),
  data: t.array(
    t.type({
      cluster_id: t.union([t.null, t.string]),
      cluster_name: t.union([t.null, t.string]),
      status: t.union([t.null, t.string]),
      codespaces: t.union([t.null, t.number]),
      runtime: t.union([t.null, t.string]),
      cores: t.union([
        t.null,
        t.type({
          total: t.union([t.null, t.number]),
          consumed: t.union([t.null, t.number]),
        }),
      ]),
      memory: t.union([
        t.null,
        t.type({
          consumed: t.union([t.null, t.number]),
          total: t.union([t.null, t.number]),
        }),
      ]),
      cost: t.union([t.null, t.number]),
    })
  ),
})

export const GetUserClustersSchema = t.type({
  getSearchedClusters: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      result_size: t.union([t.null, t.number]),
      page_size: t.union([t.null, t.number]),
      offset: t.union([t.null, t.number]),
      data: t.array(
        t.type({
          cluster_id: t.union([t.null, t.string]),
          cluster_name: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
          codespaces: t.union([t.null, t.number]),
          runtime: t.union([t.null, t.string]),
          cores: t.union([
            t.null,
            t.type({
              total: t.union([t.null, t.number]),
              consumed: t.union([t.null, t.number]),
            }),
          ]),
          memory: t.union([
            t.null,
            t.type({
              consumed: t.union([t.null, t.number]),
              total: t.union([t.null, t.number]),
            }),
          ]),
          cost: t.union([t.null, t.number]),
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
