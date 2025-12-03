import * as t from 'io-ts'

export const GetProdUsageListInputSchema = t.partial({
  featureGroupId: t.union([t.undefined, t.null, t.string]),
  featureTitle: t.union([t.undefined, t.null, t.string]),
  type: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  type: t.union([t.null, t.string]),
  title: t.union([t.null, t.string]),
  link: t.union([t.null, t.string]),
})

export const SelectionOnGetProdUsageListSchema = t.type({
  status: t.unknown,
  statusCode: t.union([t.null, t.number]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          type: t.union([t.null, t.string]),
          title: t.union([t.null, t.string]),
          link: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const GetProdUsageListSchema = t.type({
  getProdUsageList: t.union([
    t.null,
    t.type({
      status: t.unknown,
      statusCode: t.union([t.null, t.number]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              type: t.union([t.null, t.string]),
              title: t.union([t.null, t.string]),
              link: t.union([t.null, t.string]),
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
