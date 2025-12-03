import * as t from 'io-ts'

export const DeleteCodespaceInputSchema = t.partial({
  projectId: t.union([t.undefined, t.null, t.string]),
  codespaceId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  codespace_id: t.union([t.null, t.number]),
  project_id: t.union([t.null, t.number]),
})

export const SelectionOnDeleteCodespaceSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      codespace_id: t.union([t.null, t.number]),
      project_id: t.union([t.null, t.number]),
    }),
  ]),
})

export const DeleteCodespaceSchema = t.type({
  deleteCodespace: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          codespace_id: t.union([t.null, t.number]),
          project_id: t.union([t.null, t.number]),
        }),
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
