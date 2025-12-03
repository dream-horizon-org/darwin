import * as t from 'io-ts'

export const SelectionOnDataSchema = t.type({
  last_run_time: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
  workflow_id: t.union([t.null, t.string]),
  workflow_name: t.union([t.null, t.string]),
  display_name: t.union([t.null, t.string]),
})

export const SelectionOnGetRecentlyVisitedWorkflowsSchema = t.type({
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          last_run_time: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
          workflow_id: t.union([t.null, t.string]),
          workflow_name: t.union([t.null, t.string]),
          display_name: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const GetRecentlyVisitedWorkflowsSchema = t.type({
  getRecentlyVisitedWorkflows: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              last_run_time: t.union([t.null, t.string]),
              status: t.union([t.null, t.string]),
              workflow_id: t.union([t.null, t.string]),
              workflow_name: t.union([t.null, t.string]),
              display_name: t.union([t.null, t.string]),
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
