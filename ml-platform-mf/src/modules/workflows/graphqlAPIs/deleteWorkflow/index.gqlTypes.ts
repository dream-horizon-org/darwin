import * as t from 'io-ts'

export const DeleteWorkflowInputSchema = t.partial({
  workflowId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  workflow_id: t.union([t.null, t.string]),
  is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnDeleteWorkflowSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      workflow_id: t.union([t.null, t.string]),
      is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
    }),
  ]),
})

export const DeleteWorkflowSchema = t.type({
  deleteWorkflow: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          workflow_id: t.union([t.null, t.string]),
          is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
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
