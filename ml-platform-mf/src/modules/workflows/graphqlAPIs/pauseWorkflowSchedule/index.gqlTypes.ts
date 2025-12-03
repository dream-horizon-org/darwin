import * as t from 'io-ts'

export const PauseWorkflowScheduleInputSchema = t.partial({
  workflowId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  workflow_status: t.union([t.null, t.string]),
  workflow_id: t.union([t.null, t.string]),
})

export const SelectionOnPauseWorkflowScheduleSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      workflow_status: t.union([t.null, t.string]),
      workflow_id: t.union([t.null, t.string]),
    }),
  ]),
})

export const PauseWorkflowScheduleSchema = t.type({
  pauseWorkflowSchedule: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          workflow_status: t.union([t.null, t.string]),
          workflow_id: t.union([t.null, t.string]),
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
