import * as t from 'io-ts'

export const EditProjectInputSchema = t.partial({
  projectId: t.union([t.undefined, t.null, t.string]),
  projectName: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnEditProjectSchema = t.type({
  status: t.union([t.null, t.string]),
})

export const EditProjectSchema = t.type({
  editProject: t.union([t.null, t.type({status: t.union([t.null, t.string])})]),
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
