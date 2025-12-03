import * as t from 'io-ts'

export const UpdateComputeClusterTagsInputSchema = t.partial({
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
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  cluster_id: t.union([t.null, t.string]),
})

export const SelectionOnUpdateComputeClusterTagsSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
      cluster_id: t.union([t.null, t.string]),
    }),
  ]),
})

export const UpdateComputeClusterTagsSchema = t.type({
  updateComputeClusterTags: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          cluster_id: t.union([t.null, t.string]),
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
