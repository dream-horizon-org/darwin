import * as t from 'io-ts'

export const GetClusterResourcesInputSchema = t.partial({
  clusterId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  cores_used: t.union([t.null, t.number]),
  memory_used: t.union([t.null, t.number]),
})

export const SelectionOnGetClusterResourcesSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      cores_used: t.union([t.null, t.number]),
      memory_used: t.union([t.null, t.number]),
    }),
  ]),
  message: t.union([t.null, t.string]),
})

export const GetClusterResourcesSchema = t.type({
  getClusterResources: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          cores_used: t.union([t.null, t.number]),
          memory_used: t.union([t.null, t.number]),
        }),
      ]),
      message: t.union([t.null, t.string]),
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
