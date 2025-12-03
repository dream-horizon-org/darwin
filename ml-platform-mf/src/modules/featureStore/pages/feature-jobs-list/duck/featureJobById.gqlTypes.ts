import * as t from 'io-ts'

export const FetchFeatureJobsByIdInputSchema = t.type({featureJobId: t.string})

export const SelectionOnConfigSchema = t.type({
  featureGroup: t.union([t.null, t.string]),
})

export const SelectionOnDestinationsSchema = t.type({
  type: t.union([t.null, t.string]),
  config: t.union([
    t.null,
    t.type({featureGroup: t.union([t.null, t.string])}),
  ]),
})

export const SelectionOnDataSourceConfigsSchema = t.type({
  destinations: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          type: t.union([t.null, t.string]),
          config: t.union([
            t.null,
            t.type({featureGroup: t.union([t.null, t.string])}),
          ]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnDataSinkConfigsSchema = t.type({
  destinations: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          type: t.union([t.null, t.string]),
          config: t.union([
            t.null,
            t.type({featureGroup: t.union([t.null, t.string])}),
          ]),
        }),
      ])
    ),
  ]),
})

export const SelectionOnComputeMetadataSchema = t.type({
  query: t.union([t.null, t.string]),
})

export const SelectionOnResponseSchema = t.type({
  featureJobId: t.union([t.null, t.string]),
  version: t.union([t.null, t.string]),
  name: t.union([t.null, t.string]),
  tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
  descriptions: t.union([t.null, t.string]),
  dataSourceConfigs: t.union([
    t.null,
    t.type({
      destinations: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              type: t.union([t.null, t.string]),
              config: t.union([
                t.null,
                t.type({featureGroup: t.union([t.null, t.string])}),
              ]),
            }),
          ])
        ),
      ]),
    }),
  ]),
  dataSinkConfigs: t.union([
    t.null,
    t.type({
      destinations: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              type: t.union([t.null, t.string]),
              config: t.union([
                t.null,
                t.type({featureGroup: t.union([t.null, t.string])}),
              ]),
            }),
          ])
        ),
      ]),
    }),
  ]),
  computeType: t.union([t.null, t.string]),
  computeMetadata: t.union([
    t.null,
    t.type({query: t.union([t.null, t.string])}),
  ]),
  featureType: t.union([t.null, t.string]),
  schedule: t.union([t.null, t.string]),
  owner: t.union([t.null, t.string]),
  featureGroupId: t.union([t.null, t.number]),
  schedulerId: t.union([t.null, t.number]),
  createdAt: t.union([t.null, t.string]),
  updatedAt: t.union([t.null, t.string]),
  state: t.union([t.null, t.string]),
})

export const SelectionOnFetchFeatureJobsByIdSchema = t.type({
  message: t.union([t.null, t.string]),
  comments: t.union([t.null, t.string]),
  response: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          featureJobId: t.union([t.null, t.string]),
          version: t.union([t.null, t.string]),
          name: t.union([t.null, t.string]),
          tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
          descriptions: t.union([t.null, t.string]),
          dataSourceConfigs: t.union([
            t.null,
            t.type({
              destinations: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      type: t.union([t.null, t.string]),
                      config: t.union([
                        t.null,
                        t.type({featureGroup: t.union([t.null, t.string])}),
                      ]),
                    }),
                  ])
                ),
              ]),
            }),
          ]),
          dataSinkConfigs: t.union([
            t.null,
            t.type({
              destinations: t.union([
                t.null,
                t.array(
                  t.union([
                    t.null,
                    t.type({
                      type: t.union([t.null, t.string]),
                      config: t.union([
                        t.null,
                        t.type({featureGroup: t.union([t.null, t.string])}),
                      ]),
                    }),
                  ])
                ),
              ]),
            }),
          ]),
          computeType: t.union([t.null, t.string]),
          computeMetadata: t.union([
            t.null,
            t.type({query: t.union([t.null, t.string])}),
          ]),
          featureType: t.union([t.null, t.string]),
          schedule: t.union([t.null, t.string]),
          owner: t.union([t.null, t.string]),
          featureGroupId: t.union([t.null, t.number]),
          schedulerId: t.union([t.null, t.number]),
          createdAt: t.union([t.null, t.string]),
          updatedAt: t.union([t.null, t.string]),
          state: t.union([t.null, t.string]),
        }),
      ])
    ),
  ]),
})

export const FetchFeatureJobsByIdSchema = t.type({
  fetchFeatureJobsById: t.union([
    t.null,
    t.type({
      message: t.union([t.null, t.string]),
      comments: t.union([t.null, t.string]),
      response: t.union([
        t.null,
        t.array(
          t.union([
            t.null,
            t.type({
              featureJobId: t.union([t.null, t.string]),
              version: t.union([t.null, t.string]),
              name: t.union([t.null, t.string]),
              tags: t.union([t.null, t.array(t.union([t.null, t.string]))]),
              descriptions: t.union([t.null, t.string]),
              dataSourceConfigs: t.union([
                t.null,
                t.type({
                  destinations: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          type: t.union([t.null, t.string]),
                          config: t.union([
                            t.null,
                            t.type({featureGroup: t.union([t.null, t.string])}),
                          ]),
                        }),
                      ])
                    ),
                  ]),
                }),
              ]),
              dataSinkConfigs: t.union([
                t.null,
                t.type({
                  destinations: t.union([
                    t.null,
                    t.array(
                      t.union([
                        t.null,
                        t.type({
                          type: t.union([t.null, t.string]),
                          config: t.union([
                            t.null,
                            t.type({featureGroup: t.union([t.null, t.string])}),
                          ]),
                        }),
                      ])
                    ),
                  ]),
                }),
              ]),
              computeType: t.union([t.null, t.string]),
              computeMetadata: t.union([
                t.null,
                t.type({query: t.union([t.null, t.string])}),
              ]),
              featureType: t.union([t.null, t.string]),
              schedule: t.union([t.null, t.string]),
              owner: t.union([t.null, t.string]),
              featureGroupId: t.union([t.null, t.number]),
              schedulerId: t.union([t.null, t.number]),
              createdAt: t.union([t.null, t.string]),
              updatedAt: t.union([t.null, t.string]),
              state: t.union([t.null, t.string]),
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
