import * as t from 'io-ts'

export const GetWorkflowRunsInputSchema = t.partial({
  workflowId: t.union([t.undefined, t.null, t.string]),
  tags: t.union([t.undefined, t.null, t.array(t.union([t.null, t.string]))]),
  startDate: t.union([t.undefined, t.null, t.string]),
  endDate: t.union([t.undefined, t.null, t.string]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
  sortBy: t.union([t.undefined, t.null, t.string]),
  sortOrder: t.union([t.undefined, t.null, t.string]),
  filters: t.union([t.undefined, t.null, t.array(t.union([t.null, t.string]))]),
})

export const SelectionOnRunsSchema = t.type({
  duration: t.union([t.null, t.number]),
  run_id: t.union([t.null, t.string]),
  run_status: t.union([t.null, t.string]),
  start_time: t.union([t.null, t.string]),
  trigger: t.union([t.null, t.string]),
  trigger_by: t.union([t.null, t.string]),
  is_run_duration_exceeded: t.union([
    t.null,
    t.literal(false),
    t.literal(true),
  ]),
  expected_run_duration: t.union([t.null, t.number]),
})

export const SelectionOnRepairRunSchema = t.type({
  run_id: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  workflow_id: t.union([t.null, t.string]),
  runs: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          duration: t.union([t.null, t.number]),
          run_id: t.union([t.null, t.string]),
          run_status: t.union([t.null, t.string]),
          start_time: t.union([t.null, t.string]),
          trigger: t.union([t.null, t.string]),
          trigger_by: t.union([t.null, t.string]),
          is_run_duration_exceeded: t.union([
            t.null,
            t.literal(false),
            t.literal(true),
          ]),
          expected_run_duration: t.union([t.null, t.number]),
        }),
      ])
    ),
  ]),
  repair_run: t.union([
    t.null,
    t.type({
      run_id: t.union([t.null, t.string]),
      status: t.union([t.null, t.string]),
    }),
  ]),
})

export const SelectionOnGetWorkflowRunsSchema = t.type({
  offset: t.union([t.null, t.number]),
  page_size: t.union([t.null, t.number]),
  result_size: t.union([t.null, t.number]),
  data: t.union([
    t.null,
    t.type({
      workflow_id: t.union([t.null, t.string]),
      runs: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              duration: t.union([t.null, t.number]),
              run_id: t.union([t.null, t.string]),
              run_status: t.union([t.null, t.string]),
              start_time: t.union([t.null, t.string]),
              trigger: t.union([t.null, t.string]),
              trigger_by: t.union([t.null, t.string]),
              is_run_duration_exceeded: t.union([
                t.null,
                t.literal(false),
                t.literal(true),
              ]),
              expected_run_duration: t.union([t.null, t.number]),
            }),
          ])
        ),
      ]),
      repair_run: t.union([
        t.null,
        t.type({
          run_id: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
        }),
      ]),
    }),
  ]),
})

export const GetWorkflowRunsSchema = t.type({
  getWorkflowRuns: t.union([
    t.null,
    t.type({
      offset: t.union([t.null, t.number]),
      page_size: t.union([t.null, t.number]),
      result_size: t.union([t.null, t.number]),
      data: t.union([
        t.null,
        t.type({
          workflow_id: t.union([t.null, t.string]),
          runs: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  duration: t.union([t.null, t.number]),
                  run_id: t.union([t.null, t.string]),
                  run_status: t.union([t.null, t.string]),
                  start_time: t.union([t.null, t.string]),
                  trigger: t.union([t.null, t.string]),
                  trigger_by: t.union([t.null, t.string]),
                  is_run_duration_exceeded: t.union([
                    t.null,
                    t.literal(false),
                    t.literal(true),
                  ]),
                  expected_run_duration: t.union([t.null, t.number]),
                }),
              ])
            ),
          ]),
          repair_run: t.union([
            t.null,
            t.type({
              run_id: t.union([t.null, t.string]),
              status: t.union([t.null, t.string]),
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
