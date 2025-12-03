import * as t from 'io-ts'

export const DetachClusterInputSchema = t.partial({
  codespaceId: t.union([t.undefined, t.null, t.string]),
  clusterId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDetachClusterSchema = t.type({
  status: t.union([t.null, t.string]),
})

export const DetachClusterSchema = t.type({
  detachCluster: t.union([
    t.null,
    t.type({status: t.union([t.null, t.string])}),
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
