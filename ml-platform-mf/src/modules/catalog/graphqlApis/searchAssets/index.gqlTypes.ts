import * as t from 'io-ts'

export const SearchAssetsInputSchema = t.partial({
  asset_name_regex: t.union([t.undefined, t.null, t.string]),
  asset_prefix_regex: t.union([t.undefined, t.null, t.string]),
  page_size: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
  depth: t.union([t.undefined, t.null, t.number]),
})

export const SelectionOnDataSchema = t.type({
  asset_name: t.union([t.null, t.string]),
  asset_prefix: t.union([t.null, t.string]),
  depth: t.union([t.null, t.number]),
  is_terminal: t.union([t.null, t.literal(false), t.literal(true)]),
})

export const SelectionOnSearchAssetsSchema = t.type({
  total: t.union([t.null, t.number]),
  offset: t.union([t.null, t.number]),
  page_size: t.union([t.null, t.number]),
  data: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          asset_name: t.union([t.null, t.string]),
          asset_prefix: t.union([t.null, t.string]),
          depth: t.union([t.null, t.number]),
          is_terminal: t.union([t.null, t.literal(false), t.literal(true)]),
        }),
      ])
    ),
  ]),
})

export const SearchAssetsSchema = t.type({
  searchAssets: t.union([
    t.null,
    t.type({
      total: t.union([t.null, t.number]),
      offset: t.union([t.null, t.number]),
      page_size: t.union([t.null, t.number]),
      data: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              asset_name: t.union([t.null, t.string]),
              asset_prefix: t.union([t.null, t.string]),
              depth: t.union([t.null, t.number]),
              is_terminal: t.union([t.null, t.literal(false), t.literal(true)]),
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
