import * as t from 'io-ts'

export const GetLineageAssetInputSchema = t.type({assetName: t.string})

export const SelectionOnGraphSchema = t.type({
  from: t.union([t.null, t.string]),
  to: t.union([t.null, t.string]),
  fields_map: t.unknown,
})

export const SelectionOnGetLineageAssetSchema = t.type({
  graph: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          from: t.union([t.null, t.string]),
          to: t.union([t.null, t.string]),
          fields_map: t.unknown,
        }),
      ])
    ),
  ]),
  assetsInfo: t.unknown,
})

export const GetLineageAssetSchema = t.type({
  getLineageAsset: t.union([
    t.null,
    t.type({
      graph: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              from: t.union([t.null, t.string]),
              to: t.union([t.null, t.string]),
              fields_map: t.unknown,
            }),
          ])
        ),
      ]),
      assetsInfo: t.unknown,
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
