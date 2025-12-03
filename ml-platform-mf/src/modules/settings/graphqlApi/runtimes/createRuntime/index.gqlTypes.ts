import * as t from 'io-ts'

export const CreateRuntimeInputSchema = t.type({
  runtimeName: t.string,
  dockerFile: t.string,
})

export const SelectionOnCreateRuntimeSchema = t.type({
  status: t.string,
  message: t.string,
  is_unique: t.boolean,
})

export const CreateRuntimeSchema = t.type({
  createRuntime: t.type({
    status: t.string,
    message: t.string,
    is_unique: t.boolean,
  }),
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
