import * as t from 'io-ts'

export const GetWorkflowsMetaDataInputSchema = t.partial({
  names: t.union([t.undefined, t.null, t.array(t.union([t.null, t.string]))]),
})

export const SelectionOnTriggerRulesSchema = t.type({
  id: t.union([t.null, t.number]),
  label: t.union([t.null, t.string]),
  value: t.unknown,
  description: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  trigger_rules: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          id: t.union([t.null, t.number]),
          label: t.union([t.null, t.string]),
          value: t.unknown,
          description: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnGetWorkflowsMetaDataSchema = t.type({
  status: t.union([t.null, t.string]),
  message: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      trigger_rules: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              id: t.union([t.null, t.number]),
              label: t.union([t.null, t.string]),
              value: t.unknown,
              description: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
    }),
  ]),
})

export const GetWorkflowsMetaDataSchema = t.type({
  getWorkflowsMetaData: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      message: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          trigger_rules: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  id: t.union([t.null, t.number]),
                  label: t.union([t.null, t.string]),
                  value: t.unknown,
                  description: t.union([t.null, t.string]),
                }),
              ])
            ),
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
