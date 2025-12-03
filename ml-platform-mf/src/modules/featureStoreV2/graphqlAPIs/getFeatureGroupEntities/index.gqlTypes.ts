import * as t from 'io-ts'

export const GetFeatureGroupEntitiesInputSchema = t.partial({
  featureGroupName: t.union([t.undefined, t.null, t.string]),
  version: t.union([t.undefined, t.null, t.number]),
})

export const SelectionOnDataSchema = t.type({
  description: t.union([t.null, t.string]),
  entityName: t.union([t.null, t.string]),
  joinKeys: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  type: t.union([t.null, t.array(t.union([t.null, t.string]))]),
})

export const SelectionOnGetFeatureGroupEntitiesSchema = t.type({
  status: t.union([t.null, t.string]),
  statusCode: t.union([t.null, t.number]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          description: t.union([t.null, t.string]),
          entityName: t.union([t.null, t.string]),
          joinKeys: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          type: t.union([t.null, t.array(t.union([t.null, t.string]))]),
        }),
      ])
    ),
  ]),
})

export const GetFeatureGroupEntitiesSchema = t.type({
  getFeatureGroupEntities: t.union([
    t.null,
    t.type({
      status: t.union([t.null, t.string]),
      statusCode: t.union([t.null, t.number]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              description: t.union([t.null, t.string]),
              entityName: t.union([t.null, t.string]),
              joinKeys: t.union([t.null, t.array(t.union([t.null, t.string]))]),
              tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
              type: t.union([t.null, t.array(t.union([t.null, t.string]))]),
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
