import * as t from 'io-ts'

export const GetWorkflowPathIdsInputSchema = t.type({workspacePath: t.string})

export const SelectionOnDataSchema = t.type({
  codespace_id: t.union([t.null, t.number]),
  project_id: t.union([t.null, t.number]),
})

export const SelectionOnGetWorkflowPathDetailsSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      codespace_id: t.union([t.null, t.number]),
      project_id: t.union([t.null, t.number]),
    }),
  ]),
})

export const GetWorkflowPathIdsSchema = t.type({
  getWorkflowPathDetails: t.union([
    t.null,
    t.type({
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
