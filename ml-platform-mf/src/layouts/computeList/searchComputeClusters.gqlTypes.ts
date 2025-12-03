import * as t from 'io-ts'

export const SearchInputSchema = t.partial({
  searchQuery: t.union([t.undefined, t.null, t.string]),
  filters: t.union([
    t.undefined,
    t.null,
    t.partial({
      status: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.string])),
      ]),
    }),
  ]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
  sortBy: t.union([t.undefined, t.null, t.string]),
  sortOrder: t.union([t.undefined, t.null, t.string]),
  filterByMe: t.union([t.undefined, t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnDataSchema = t.type({
  clusterId: t.union([t.null, t.string]),
  clusterName: t.union([t.null, t.string]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  status: t.union([t.null, t.string]),
  runtime: t.union([t.null, t.string]),
  activePod: t.union([t.null, t.number]),
  totalPod: t.union([t.null, t.number]),
  totalMemory: t.union([t.null, t.number]),
  jupyterLabLink: t.union([t.null, t.string]),
  createBy: t.union([t.null, t.string]),
  createdOn: t.union([t.null, t.string]),
  lastUsedOn: t.union([t.null, t.string]),
})

export const SelectionOnSearchComputeClustersSchema = t.type({
  status: t.union([t.null, t.string]),
  pageSize: t.union([t.null, t.number]),
  offset: t.union([t.null, t.number]),
  resultSize: t.union([t.null, t.number]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          clusterId: t.union([t.null, t.string]),
          clusterName: t.union([t.null, t.string]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          status: t.union([t.null, t.string]),
          runtime: t.union([t.null, t.string]),
          activePod: t.union([t.null, t.number]),
          totalPod: t.union([t.null, t.number]),
          totalMemory: t.union([t.null, t.number]),
          jupyterLabLink: t.union([t.null, t.string]),
          createBy: t.union([t.null, t.string]),
          createdOn: t.union([t.null, t.string]),
          lastUsedOn: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SearchSchema = t.type({
  searchComputeClusters: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      pageSize: t.union([t.null, t.number]),
      offset: t.union([t.null, t.number]),
      resultSize: t.union([t.null, t.number]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              clusterId: t.union([t.null, t.string]),
              clusterName: t.union([t.null, t.string]),
              tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
              status: t.union([t.null, t.string]),
              runtime: t.union([t.null, t.string]),
              activePod: t.union([t.null, t.number]),
              totalPod: t.union([t.null, t.number]),
              totalMemory: t.union([t.null, t.number]),
              jupyterLabLink: t.union([t.null, t.string]),
              createBy: t.union([t.null, t.string]),
              createdOn: t.union([t.null, t.string]),
              lastUsedOn: t.union([t.null, t.string]),
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
