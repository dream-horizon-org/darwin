import * as t from 'io-ts'

export const RunWorkflowRunInputSchema = t.partial({
  workflowId: t.union([t.undefined, t.null, t.string]),
  parameters: t.unknown,
})

export const SelectionOnLastRunSchema = t.type({
  run_id: t.union([t.null, t.string]),
  start_time: t.union([t.null, t.string]),
  duration: t.union([t.null, t.number]),
  run_status: t.union([t.null, t.string]),
  trigger: t.union([t.null, t.string]),
  trigger_by: t.union([t.null, t.string]),
  is_run_duration_exceeded: t.union([
    t.null,
    t.literal(false),
    t.literal(true),
  ]),
  expected_run_duration: t.union([t.null, t.number]),
})

export const SelectionOnDataSchema = t.type({
  workflow_id: t.union([t.null, t.string]),
  last_runs_status: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  last_run: t.union([
    t.null,
    t.type({
      run_id: t.union([t.null, t.string]),
      start_time: t.union([t.null, t.string]),
      duration: t.union([t.null, t.number]),
      run_status: t.union([t.null, t.string]),
      trigger: t.union([t.null, t.string]),
      trigger_by: t.union([t.null, t.string]),
      is_run_duration_exceeded: t.union([
        t.null,
        t.literal(false),
        t.literal(true),
      ]),
      expected_run_duration: t.union([t.null, t.number]),
    }),
  ]),
})

export const SelectionOnRunWorkflowRunSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      workflow_id: t.union([t.null, t.string]),
      last_runs_status: t.union([t.null, t.array(t.union([t.null, t.string]))]),
      last_run: t.union([
        t.null,
        t.type({
          run_id: t.union([t.null, t.string]),
          start_time: t.union([t.null, t.string]),
          duration: t.union([t.null, t.number]),
          run_status: t.union([t.null, t.string]),
          trigger: t.union([t.null, t.string]),
          trigger_by: t.union([t.null, t.string]),
          is_run_duration_exceeded: t.union([
            t.null,
            t.literal(false),
            t.literal(true),
          ]),
          expected_run_duration: t.union([t.null, t.number]),
        }),
      ]),
    }),
  ]),
})

export const RunWorkflowRunSchema = t.type({
  runWorkflowRun: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          workflow_id: t.union([t.null, t.string]),
          last_runs_status: t.union([
            t.null,
            t.array(t.union([t.null, t.string])),
          ]),
          last_run: t.union([
            t.null,
            t.type({
              run_id: t.union([t.null, t.string]),
              start_time: t.union([t.null, t.string]),
              duration: t.union([t.null, t.number]),
              run_status: t.union([t.null, t.string]),
              trigger: t.union([t.null, t.string]),
              trigger_by: t.union([t.null, t.string]),
              is_run_duration_exceeded: t.union([
                t.null,
                t.literal(false),
                t.literal(true),
              ]),
              expected_run_duration: t.union([t.null, t.number]),
            }),
          ]),
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
