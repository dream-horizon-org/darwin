import * as t from 'io-ts'

export const SelectionOnDataSchema = t.type({
  template_id: t.union([t.null, t.string]),
  display_name: t.union([t.null, t.string]),
  memory_per_core: t.union([t.null, t.string]),
})

export const SelectionOnGetComputeTemplatesSchema = t.type({
  status: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          template_id: t.union([t.null, t.string]),
          display_name: t.union([t.null, t.string]),
          memory_per_core: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const GetComputeTemplatesSchema = t.type({
  getComputeTemplates: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              template_id: t.union([t.null, t.string]),
              display_name: t.union([t.null, t.string]),
              memory_per_core: t.union([t.null, t.string]),
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
