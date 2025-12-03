import * as t from 'io-ts'

export const AddRecentlyVisitedClusterInputSchema = t.partial({
  clusterId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnAddRecentlyVisitedClusterSchema = t.type({
  status: t.union([t.null, t.string]),
})

export const AddRecentlyVisitedClusterSchema = t.type({
  addRecentlyVisitedCluster: t.union([
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
