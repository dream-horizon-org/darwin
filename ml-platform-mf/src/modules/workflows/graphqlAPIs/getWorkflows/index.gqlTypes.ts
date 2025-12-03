import * as t from 'io-ts'

export const GetWorkflowsInputSchema = t.partial({
  query: t.union([t.undefined, t.null, t.string]),
  filters: t.union([
    t.undefined,
    t.null,
    t.partial({
      user: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.string])),
      ]),
      status: t.union([
        t.undefined,
        t.null,
        t.array(t.union([t.null, t.string])),
      ]),
    }),
  ]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
  sortBy: t.union([t.undefined, t.null, t.string]),
  sortOrder: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnLastRunDetailsSchema = t.type({
  run_status: t.union([t.null, t.string]),
  is_run_duration_exceeded: t.union([
    t.null,
    t.literal(false),
    t.literal(true),
  ]),
  expected_run_duration: t.union([t.null, t.number]),
})

export const SelectionOnDataSchema = t.type({
  workflow_name: t.union([t.null, t.string]),
  display_name: t.union([t.null, t.string]),
  description: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
  workflow_id: t.union([t.null, t.string]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  schedule: t.union([t.null, t.string]),
  last_run_details: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          run_status: t.union([t.null, t.string]),
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
  next_run_time: t.union([t.null, t.string]),
  owner: t.union([t.null, t.string]),
})

export const SelectionOnGetWorkflowsSchema = t.type({
  result_size: t.union([t.null, t.number]),
  page_size: t.union([t.null, t.number]),
  offset: t.union([t.null, t.number]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          workflow_name: t.union([t.null, t.string]),
          display_name: t.union([t.null, t.string]),
          description: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
          workflow_id: t.union([t.null, t.string]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          schedule: t.union([t.null, t.string]),
          last_run_details: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  run_status: t.union([t.null, t.string]),
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
          next_run_time: t.union([t.null, t.string]),
          owner: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const GetWorkflowsSchema = t.type({
  getWorkflows: t.union([
    t.null,
    t.type({
      result_size: t.union([t.null, t.number]),
      page_size: t.union([t.null, t.number]),
      offset: t.union([t.null, t.number]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              workflow_name: t.union([t.null, t.string]),
              display_name: t.union([t.null, t.string]),
              description: t.union([t.null, t.string]),
              status: t.union([t.null, t.string]),
              workflow_id: t.union([t.null, t.string]),
              tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
              schedule: t.union([t.null, t.string]),
              last_run_details: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      run_status: t.union([t.null, t.string]),
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
              next_run_time: t.union([t.null, t.string]),
              owner: t.union([t.null, t.string]),
            }),
          ])
        ),
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
