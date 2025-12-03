import * as t from 'io-ts'

export const DeleteProjectInputSchema = t.partial({
  projectId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  project_id: t.union([t.null, t.number]),
})

export const SelectionOnDeleteProjectSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([t.null, t.type({project_id: t.union([t.null, t.number])})]),
})

export const DeleteProjectSchema = t.type({
  deleteProject: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({project_id: t.union([t.null, t.number])}),
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
