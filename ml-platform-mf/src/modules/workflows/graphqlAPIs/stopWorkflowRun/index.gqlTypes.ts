import * as t from 'io-ts'

export const StopWorkflowRunInputSchema = t.partial({
  workflowId: t.union([t.undefined, t.null, t.string]),
  runId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  workflow_id: t.union([t.null, t.string]),
  run_id: t.union([t.null, t.string]),
  run_status: t.union([t.null, t.string]),
})

export const SelectionOnStopWorkflowRunSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      workflow_id: t.union([t.null, t.string]),
      run_id: t.union([t.null, t.string]),
      run_status: t.union([t.null, t.string]),
    }),
  ]),
})

export const StopWorkflowRunSchema = t.type({
  stopWorkflowRun: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          workflow_id: t.union([t.null, t.string]),
          run_id: t.union([t.null, t.string]),
          run_status: t.union([t.null, t.string]),
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
