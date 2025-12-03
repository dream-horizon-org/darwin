import * as t from 'io-ts'

export const GetAllPurposeClustersInputSchema = t.partial({
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
    }),
  ]),
  excludeFilters: t.union([
    t.undefined,
    t.null,
    t.partial({
      user: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.string])),
      ]),
    }),
  ]),
})

export const SelectionOnDataSchema = t.type({
  cluster_id: t.union([t.null, t.string]),
  name: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
  total_cores: t.union([t.null, t.number]),
  total_memory: t.union([t.null, t.number]),
  runtime: t.union([t.null, t.string]),
  created_on: t.union([t.null, t.string]),
  last_used_on: t.union([t.null, t.string]),
  create_by: t.union([t.null, t.string]),
  estimated_cost: t.union([t.null, t.string]),
})

export const SelectionOnGetAllPurposeClustersSchema = t.type({
  status: t.union([t.null, t.string]),
  result_size: t.union([t.null, t.number]),
  page_size: t.union([t.null, t.number]),
  offset: t.union([t.null, t.number]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          cluster_id: t.union([t.null, t.string]),
          name: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
          total_cores: t.union([t.null, t.number]),
          total_memory: t.union([t.null, t.number]),
          runtime: t.union([t.null, t.string]),
          created_on: t.union([t.null, t.string]),
          last_used_on: t.union([t.null, t.string]),
          create_by: t.union([t.null, t.string]),
          estimated_cost: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const GetAllPurposeClustersSchema = t.type({
  getAllPurposeClusters: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      result_size: t.union([t.null, t.number]),
      page_size: t.union([t.null, t.number]),
      offset: t.union([t.null, t.number]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              cluster_id: t.union([t.null, t.string]),
              name: t.union([t.null, t.string]),
              status: t.union([t.null, t.string]),
              total_cores: t.union([t.null, t.number]),
              total_memory: t.union([t.null, t.number]),
              runtime: t.union([t.null, t.string]),
              created_on: t.union([t.null, t.string]),
              last_used_on: t.union([t.null, t.string]),
              create_by: t.union([t.null, t.string]),
              estimated_cost: t.union([t.null, t.string]),
            }),
          ])
        ),
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
