import * as t from 'io-ts'

export const DeleteModelDeploymentForIdInputSchema = t.type({
  deploymentId: t.number,
})

export const SelectionOnDeleteModelDeploymentForIdSchema = t.type({
  status: t.union([t.null, t.string]),
})

export const DeleteModelDeploymentForIdSchema = t.type({
  deleteModelDeploymentForId: t.union([
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
