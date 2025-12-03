import * as t from 'io-ts'

export const GetFeaturesInputSchema = t.partial({
  searchString: t.union([t.undefined, t.null, t.string]),
  featureGroupId: t.union([t.undefined, t.null, t.string]),
  version: t.union([t.undefined, t.null, t.number]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
  sortBy: t.union([t.undefined, t.null, t.string]),
  sortOrder: t.union([t.undefined, t.null, t.string]),
  type: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnCopyCodeSchema = t.type({
  name: t.union([t.null, t.string]),
  value: t.union([t.null, t.string]),
})

export const SelectionOnUsageSchema = t.type({
  prodCount: t.union([t.null, t.number]),
  devCount: t.union([t.null, t.number]),
})

export const SelectionOnDataSchema = t.type({
  title: t.union([t.null, t.string]),
  description: t.union([t.null, t.string]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  type: t.union([t.null, t.string]),
  copyCode: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          value: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
  isPrimaryKey: t.union([t.null, t.literal(false), t.literal(true)]),
  usage: t.union([
    t.null,
    t.type({
      prodCount: t.union([t.null, t.number]),
      devCount: t.union([t.null, t.number]),
    }),
  ]),
})

export const SelectionOnGetFeaturesSchema = t.type({
  status: t.unknown,
  statusCode: t.union([t.null, t.number]),
  resultSize: t.union([t.null, t.number]),
  pageSize: t.union([t.null, t.number]),
  offset: t.union([t.null, t.number]),
  totalRecordsCount: t.union([t.null, t.number]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          title: t.union([t.null, t.string]),
          description: t.union([t.null, t.string]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          type: t.union([t.null, t.string]),
          copyCode: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  value: t.union([t.null, t.string]),
                }),
              ])
            ),
          ]),
          isPrimaryKey: t.union([t.null, t.literal(false), t.literal(true)]),
          usage: t.union([
            t.null,
            t.type({
              prodCount: t.union([t.null, t.number]),
              devCount: t.union([t.null, t.number]),
            }),
          ]),
        }),
      ])
    ),
  ]),
})

export const GetFeaturesSchema = t.type({
  getFeatures: t.union([
    t.null,
    t.type({
      status: t.unknown,
      statusCode: t.union([t.null, t.number]),
      resultSize: t.union([t.null, t.number]),
      pageSize: t.union([t.null, t.number]),
      offset: t.union([t.null, t.number]),
      totalRecordsCount: t.union([t.null, t.number]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              title: t.union([t.null, t.string]),
              description: t.union([t.null, t.string]),
              tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
              type: t.union([t.null, t.string]),
              copyCode: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      name: t.union([t.null, t.string]),
                      value: t.union([t.null, t.string]),
                    }),
                  ])
                ),
              ]),
              isPrimaryKey: t.union([
                t.null,
                t.literal(false),
                t.literal(true),
              ]),
              usage: t.union([
                t.null,
                t.type({
                  prodCount: t.union([t.null, t.number]),
                  devCount: t.union([t.null, t.number]),
                }),
              ]),
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
