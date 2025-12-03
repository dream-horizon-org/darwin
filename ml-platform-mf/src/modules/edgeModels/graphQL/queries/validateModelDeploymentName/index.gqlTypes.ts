import * as t from 'io-ts'

export const ValidateModelDeploymentNameInputSchema = t.type({
  deploymentName: t.string,
})

export const SelectionOnDataSchema = t.type({
  unique: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnValidateModelDeploymentNameSchema = t.type({
  data: t.type({unique: t.union([t.null, t.literal(false), t.literal(true)])}),
})

export const ValidateModelDeploymentNameSchema = t.type({
  validateModelDeploymentName: t.union([
    t.null,
    t.type({
      data: t.type({
        unique: t.union([t.null, t.literal(false), t.literal(true)]),
      }),
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
