import * as t from 'io-ts'

export const UpdateWorkflowRetriesInputSchema = t.partial({
  workflowId: t.union([t.undefined, t.null, t.string]),
  retries: t.union([t.undefined, t.null, t.number]),
})

export const SelectionOnDataSchema = t.type({
  workflow_id: t.union([t.null, t.string]),
  retries: t.union([t.null, t.number]),
})

export const SelectionOnUpdateWorkflowRetriesSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      workflow_id: t.union([t.null, t.string]),
      retries: t.union([t.null, t.number]),
    }),
  ]),
})

export const UpdateWorkflowRetriesSchema = t.type({
  updateWorkflowRetries: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          workflow_id: t.union([t.null, t.string]),
          retries: t.union([t.null, t.number]),
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
