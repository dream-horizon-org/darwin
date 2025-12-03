import * as t from 'io-ts'

export const SelectionOnCreateExperimentationUserSchema = t.type({
  status: t.union([t.null, t.string]),
  message: t.union([t.null, t.string]),
})

export const CreateExperimentationUserSchema = t.type({
  createExperimentationUser: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
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
