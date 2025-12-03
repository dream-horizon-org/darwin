import * as t from 'io-ts'

export const SelectionOnDataSchema = t.type({
  id: t.union([t.null, t.number]),
  label: t.union([t.null, t.string]),
})

export const SelectionOnGetLogComponentsSchema = t.type({
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          id: t.union([t.null, t.number]),
          label: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const GetLogComponentsSchema = t.type({
  getLogComponents: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              id: t.union([t.null, t.number]),
              label: t.union([t.null, t.string]),
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
