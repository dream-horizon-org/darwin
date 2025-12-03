import * as t from 'io-ts'

export const FetchFilteredFeatureGroupsInputSchema = t.partial({
  query: t.union([t.undefined, t.null, t.string]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
  ownerEmail: t.union([
    t.undefined,
    t.null,
    t.array(t.union([t.null, t.string])),
  ]),
  tags: t.union([t.undefined, t.null, t.array(t.union([t.null, t.string]))]),
  sortBy: t.union([t.undefined, t.null, t.string]),
  order: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnFeatureGroupsSchema = t.type({
  name: t.union([t.null, t.string]),
  version: t.union([t.null, t.number]),
  ownerEmail: t.union([t.null, t.string]),
  createdDate: t.union([t.null, t.string]),
  status: t.union([t.null, t.string]),
  description: t.union([t.null, t.string]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
})

export const SelectionOnDataSchema = t.type({
  offset: t.union([t.null, t.number]),
  pageSize: t.union([t.null, t.number]),
  totalResults: t.union([t.null, t.number]),
  featureGroups: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          name: t.union([t.null, t.string]),
          version: t.union([t.null, t.number]),
          ownerEmail: t.union([t.null, t.string]),
          createdDate: t.union([t.null, t.string]),
          status: t.union([t.null, t.string]),
          description: t.union([t.null, t.string]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnFetchFilteredFeatureGroupsSchema = t.type({
  data: t.union([
    t.null,
    t.type({
      offset: t.union([t.null, t.number]),
      pageSize: t.union([t.null, t.number]),
      totalResults: t.union([t.null, t.number]),
      featureGroups: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              name: t.union([t.null, t.string]),
              version: t.union([t.null, t.number]),
              ownerEmail: t.union([t.null, t.string]),
              createdDate: t.union([t.null, t.string]),
              status: t.union([t.null, t.string]),
              description: t.union([t.null, t.string]),
              tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
            }),
          ])
        ),
      ]),
    }),
  ]),
})

export const FetchFilteredFeatureGroupsSchema = t.type({
  fetchFilteredFeatureGroups: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
          offset: t.union([t.null, t.number]),
          pageSize: t.union([t.null, t.number]),
          totalResults: t.union([t.null, t.number]),
          featureGroups: t.union([
            t.null,
            t.array(
              t.union([
                t.null,
                t.type({
                  name: t.union([t.null, t.string]),
                  version: t.union([t.null, t.number]),
                  ownerEmail: t.union([t.null, t.string]),
                  createdDate: t.union([t.null, t.string]),
                  status: t.union([t.null, t.string]),
                  description: t.union([t.null, t.string]),
                  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
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
