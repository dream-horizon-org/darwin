import * as t from 'io-ts'

export const UpdateComputeClusterNameInputSchema = t.partial({
  input: t.union([
    t.undefined,
    t.null,
    t.partial({
      clusterId: t.union([t.undefined, t.null, t.string]),
      data: t.unknown,
    }),
  ]),
})

export const SelectionOnDataSchema = t.type({name: t.union([t.null, t.string])})

export const SelectionOnUpdateComputeClusterNameSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([t.null, t.type({name: t.union([t.null, t.string])})]),
})

export const UpdateComputeClusterNameSchema = t.type({
  updateComputeClusterName: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([t.null, t.type({name: t.union([t.null, t.string])})]),
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
