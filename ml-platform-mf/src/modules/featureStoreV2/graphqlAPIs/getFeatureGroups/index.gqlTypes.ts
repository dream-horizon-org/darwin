import * as t from 'io-ts'

export const GetFeatureGroupsInputSchema = t.partial({
  searchString: t.union([t.undefined, t.null, t.string]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  offset: t.union([t.undefined, t.null, t.number]),
  sortBy: t.union([t.undefined, t.null, t.string]),
  sortOrder: t.union([t.undefined, t.null, t.string]),
  filters: t.union([
    t.undefined,
    t.null,
    t.array(
      t.union([
        t.null,
        t.partial({
          name: t.union([t.undefined, t.null, t.string]),
          value: t.union([
            t.undefined,
            t.null,
            t.array(t.union([t.null, t.string])),
          ]),
        }),
      ])
    ),
  ]),
  type: t.union([t.undefined, t.null, t.string]),
  user: t.union([t.undefined, t.null, t.string]),
})

export const SelectionOnCopyCodeSchema = t.type({
  name: t.union([t.null, t.string]),
  value: t.union([t.null, t.string]),
})

export const SelectionOnDataSchema = t.type({
  id: t.union([t.null, t.string]),
  title: t.union([t.null, t.string]),
  description: t.union([t.null, t.string]),
  version: t.union([t.null, t.number]),
  allVersions: t.union([t.null, t.array(t.union([t.null, t.number]))]),
  featuresCount: t.union([t.null, t.number]),
  devUsage: t.union([t.null, t.number]),
  prodUsage: t.union([t.null, t.number]),
  lastValueUpdated: t.union([t.null, t.string]),
  createdBy: t.union([t.null, t.string]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  lastFiveRuns: t.union([t.null, t.array(t.unknown)]),
  type: t.union([t.null, t.string]),
  typesAvailable: t.union([t.null, t.array(t.union([t.null, t.string]))]),
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
})

export const SelectionOnGetFeatureGroupsSchema = t.type({
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
          id: t.union([t.null, t.string]),
          title: t.union([t.null, t.string]),
          description: t.union([t.null, t.string]),
          version: t.union([t.null, t.number]),
          allVersions: t.union([t.null, t.array(t.union([t.null, t.number]))]),
          featuresCount: t.union([t.null, t.number]),
          devUsage: t.union([t.null, t.number]),
          prodUsage: t.union([t.null, t.number]),
          lastValueUpdated: t.union([t.null, t.string]),
          createdBy: t.union([t.null, t.string]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          lastFiveRuns: t.union([t.null, t.array(t.unknown)]),
          type: t.union([t.null, t.string]),
          typesAvailable: t.union([
            t.null,
            t.array(t.union([t.null, t.string])),
          ]),
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
        }),
      ])
    ),
  ]),
})

export const GetFeatureGroupsSchema = t.type({
  getFeatureGroups: t.union([
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
              id: t.union([t.null, t.string]),
              title: t.union([t.null, t.string]),
              description: t.union([t.null, t.string]),
              version: t.union([t.null, t.number]),
              allVersions: t.union([
                t.null,
                t.array(t.union([t.null, t.number])),
              ]),
              featuresCount: t.union([t.null, t.number]),
              devUsage: t.union([t.null, t.number]),
              prodUsage: t.union([t.null, t.number]),
              lastValueUpdated: t.union([t.null, t.string]),
              createdBy: t.union([t.null, t.string]),
              tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
              lastFiveRuns: t.union([t.null, t.array(t.unknown)]),
              type: t.union([t.null, t.string]),
              typesAvailable: t.union([
                t.null,
                t.array(t.union([t.null, t.string])),
              ]),
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
