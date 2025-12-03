import * as t from 'io-ts'

export const GetWorkflowYamlInputSchema = t.partial({
  workflowId: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  yaml: t.union([t.null, t.string]),
  workflow_id: t.union([t.null, t.string]),
})

export const SelectionOnGetWorkflowYamlSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      yaml: t.union([t.null, t.string]),
      workflow_id: t.union([t.null, t.string]),
    }),
  ]),
})

export const GetWorkflowYamlSchema = t.type({
  getWorkflowYaml: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          yaml: t.union([t.null, t.string]),
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
