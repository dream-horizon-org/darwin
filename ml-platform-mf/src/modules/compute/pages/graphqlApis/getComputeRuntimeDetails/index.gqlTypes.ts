import * as t from 'io-ts'

export const GetComputeRuntimeDetailsInputSchema = t.partial({
  runtime: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnComponentsSchema = t.type({
  name: t.union([t.null, t.string]),
  version: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  id: t.union([t.null, t.number]),
  class: t.union([t.null, t.string]),
  type: t.union([t.null, t.string]),
  runtime: t.union([t.null, t.string]),
  image: t.union([t.null, t.string]),
  reference_link: t.union([t.null, t.string]),
  components: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          version: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  created_by: t.union([t.null, t.string]),
  last_updated_by: t.union([t.null, t.string]),
  created_at: t.union([t.null, t.string]),
  last_updated_at: t.union([t.null, t.string]),
  is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
  spark_connect: t.union([t.null, t.literal(false), t.literal(true)]),
  spark_auto_init: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnGetComputeRuntimeDetailsSchema = t.type({
  status: t.unknown,
  message: t.union([t.null, t.string]),
  data: t.union([
    t.null,
    t.type({
      id: t.union([t.null, t.number]),
      class: t.union([t.null, t.string]),
      type: t.union([t.null, t.string]),
      runtime: t.union([t.null, t.string]),
      image: t.union([t.null, t.string]),
      reference_link: t.union([t.null, t.string]),
      components: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              name: t.union([t.null, t.string]),
              version: t.union([t.null, t.string]),
            }),
          ])
        ),
      ]),
      created_by: t.union([t.null, t.string]),
      last_updated_by: t.union([t.null, t.string]),
      created_at: t.union([t.null, t.string]),
      last_updated_at: t.union([t.null, t.string]),
      is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
      spark_connect: t.union([t.null, t.literal(false), t.literal(true)]),
      spark_auto_init: t.union([t.null, t.literal(false), t.literal(true)]),
    }),
  ]),
})

export const GetComputeRuntimeDetailsSchema = t.type({
  getComputeRuntimeDetails: t.union([
    t.null,
    t.type({
      status: t.unknown,
      message: t.union([t.null, t.string]),
      data: t.union([
        t.null,
        t.type({
          id: t.union([t.null, t.number]),
          class: t.union([t.null, t.string]),
          type: t.union([t.null, t.string]),
          runtime: t.union([t.null, t.string]),
          image: t.union([t.null, t.string]),
          reference_link: t.union([t.null, t.string]),
          components: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  version: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          created_by: t.union([t.null, t.string]),
          last_updated_by: t.union([t.null, t.string]),
          created_at: t.union([t.null, t.string]),
          last_updated_at: t.union([t.null, t.string]),
          is_deleted: t.union([t.null, t.literal(false), t.literal(true)]),
          spark_connect: t.union([t.null, t.literal(false), t.literal(true)]),
          spark_auto_init: t.union([t.null, t.literal(false), t.literal(true)]),
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
