import * as t from 'io-ts'

export const PublishDeploymentInputSchema = t.type({
  modelDeploymentId: t.string,
  appVersion: t.array(t.string),
})

export const SelectionOnPublishDeploymentSchema = t.type({
  failureReason: t.union([t.null, t.string]),
  success: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const PublishDeploymentSchema = t.type({
  publishDeployment: t.union([
    t.null,
    t.type({
      failureReason: t.union([t.null, t.string]),
      success: t.union([t.null, t.literal(false), t.literal(true)]),
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
