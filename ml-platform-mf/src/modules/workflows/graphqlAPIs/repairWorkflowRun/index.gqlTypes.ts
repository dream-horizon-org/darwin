import * as t from 'io-ts'

export const RepairWorkflowRunInputSchema = t.partial({
  workflowId: t.union([t.undefined, t.null, t.string]),
  runId: t.union([t.undefined, t.null, t.string]),
  selectedTasks: t.union([
    t.undefined,
    t.null,
    t.array(t.union([t.null, t.string])),
  ]),
})

export const SelectionOnDataSchema = t.type({
  message: t.union([t.null, t.string]),
})

export const SelectionOnRepairWorkflowRunSchema = t.type({
  data: t.union([t.null, t.type({message: t.union([t.null, t.string])})]),
})

export const RepairWorkflowRunSchema = t.type({
  repairWorkflowRun: t.union([
    t.null,
    t.type({
      data: t.union([t.null, t.type({message: t.union([t.null, t.string])})]),
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
