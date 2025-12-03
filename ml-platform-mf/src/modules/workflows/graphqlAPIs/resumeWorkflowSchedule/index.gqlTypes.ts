import * as t from 'io-ts'

export const ResumeWorkflowScheduleInputSchema = t.partial({
  workflowId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  workflow_id: t.union([t.null, t.string]),
  workflow_status: t.union([t.null, t.string]),
})

export const SelectionOnResumeWorkflowScheduleSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      workflow_id: t.union([t.null, t.string]),
      workflow_status: t.union([t.null, t.string]),
    }),
  ]),
})

export const ResumeWorkflowScheduleSchema = t.type({
  resumeWorkflowSchedule: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          workflow_id: t.union([t.null, t.string]),
          workflow_status: t.union([t.null, t.string]),
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
