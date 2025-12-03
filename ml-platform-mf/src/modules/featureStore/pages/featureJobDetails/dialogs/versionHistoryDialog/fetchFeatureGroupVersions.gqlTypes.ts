import * as t from 'io-ts'

export const FetchFeatureGroupVersionsInputSchema = t.partial({
  featureGroupName: t.union([t.undefined, t.null, t.string]),
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

export const SelectionOnFetchFeatureGroupVersionsSchema = t.type({
  data: t.union([
    t.null,
    t.type({
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

export const FetchFeatureGroupVersionsSchema = t.type({
  fetchFeatureGroupVersions: t.union([
    t.null,
    t.type({
      data: t.union([
        t.null,
        t.type({
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
