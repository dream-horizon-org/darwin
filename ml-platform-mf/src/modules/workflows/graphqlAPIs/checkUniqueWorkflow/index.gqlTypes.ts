import * as t from 'io-ts'

export const CheckUniqueWorkflowInputSchema = t.partial({
  name: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  unique: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnCheckUniqueWorkflowSchema = t.type({
  data: t.union([
    t.null,
    t.type({unique: t.union([t.null, t.literal(false), t.literal(true)])}),
  ]),
})

export const CheckUniqueWorkflowSchema = t.type({
  checkUniqueWorkflow: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({unique: t.union([t.null, t.literal(false), t.literal(true)])}),
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
