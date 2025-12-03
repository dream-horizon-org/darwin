import * as t from 'io-ts'

export const GetModelDeploymentForIdInputSchema = t.type({
  deploymentId: t.string,
})

export const SelectionOnCompatibleAppVersionsSchema = t.type({
  appName: t.union([t.null, t.string]),
  codepushVersion: t.union([t.null, t.string]),
  id: t.union([t.null, t.string]),
  semver: t.union([t.null, t.string]),
  buildNumber: t.union([t.null, t.number]),
  createdAt: t.union([t.null, t.string]),
  lastUpdatedAt: t.union([t.null, t.string]),
  status: t.unknown,
})

export const SelectionOnPropsSchema = t.type({
  defaultVal: t.string,
  propName: t.string,
  propNameMapping: t.string,
  sqlDataType: t.string,
})

export const SelectionOnEventDataSchema = t.type({
  eventName: t.string,
  type: t.unknown,
  props: t.array(
    t.type({
      defaultVal: t.string,
      propName: t.string,
      propNameMapping: t.string,
      sqlDataType: t.string,
    })
  ),
})

export const SelectionOnEventTablesSchema = t.type({
  id: t.union([t.null, t.string]),
  tableName: t.string,
  expiryInSecs: t.union([t.null, t.number]),
  queries: t.array(t.string),
  eventData: t.type({
    eventName: t.string,
    type: t.unknown,
    props: t.array(
      t.type({
        defaultVal: t.string,
        propName: t.string,
        propNameMapping: t.string,
        sqlDataType: t.string,
      })
    ),
  }),
  version: t.union([t.null, t.string]),
})

export const SelectionOnFeaturesSchema = t.type({
  defaultVal: t.string,
  featureName: t.string,
  sqlDataType: t.string,
})

export const SelectionOnFeatureGroupDataSchema = t.type({
  featureGroupName: t.string,
  features: t.array(
    t.type({defaultVal: t.string, featureName: t.string, sqlDataType: t.string})
  ),
})

export const SelectionOnFeatureGroupTablesSchema = t.type({
  featureGroupData: t.type({
    featureGroupName: t.string,
    features: t.array(
      t.type({
        defaultVal: t.string,
        featureName: t.string,
        sqlDataType: t.string,
      })
    ),
  }),
  id: t.union([t.null, t.string]),
  queries: t.array(t.string),
  tableName: t.string,
})

export const SelectionOnDataSchema = t.type({
  id: t.union([t.null, t.string]),
  deploymentName: t.union([t.null, t.string]),
  modelType: t.unknown,
  modelName: t.union([t.null, t.string]),
  mlFlowModel: t.union([t.null, t.string]),
  mlFlowVersion: t.union([t.null, t.number]),
  tags: t.array(t.string),
  configFilePath: t.union([t.null, t.string]),
  testDataPath: t.union([t.null, t.string]),
  modelArtifactPath: t.union([t.null, t.string]),
  compatibleAppVersions: t.array(
    t.type({
      appName: t.union([t.null, t.string]),
      codepushVersion: t.union([t.null, t.string]),
      id: t.union([t.null, t.string]),
      semver: t.union([t.null, t.string]),
      buildNumber: t.union([t.null, t.number]),
      createdAt: t.union([t.null, t.string]),
      lastUpdatedAt: t.union([t.null, t.string]),
      status: t.unknown,
    })
  ),
  eventTables: t.array(
    t.type({
      id: t.union([t.null, t.string]),
      tableName: t.string,
      expiryInSecs: t.union([t.null, t.number]),
      queries: t.array(t.string),
      eventData: t.type({
        eventName: t.string,
        type: t.unknown,
        props: t.array(
          t.type({
            defaultVal: t.string,
            propName: t.string,
            propNameMapping: t.string,
            sqlDataType: t.string,
          })
        ),
      }),
      version: t.union([t.null, t.string]),
    })
  ),
  featureGroupTables: t.union([
    t.null,
    t.array(
      t.union([
        t.null,
        t.type({
          featureGroupData: t.type({
            featureGroupName: t.string,
            features: t.array(
              t.type({
                defaultVal: t.string,
                featureName: t.string,
                sqlDataType: t.string,
              })
            ),
          }),
          id: t.union([t.null, t.string]),
          queries: t.array(t.string),
          tableName: t.string,
        }),
      ])
    ),
  ]),
})

export const SelectionOnGetModelDeploymentForIdSchema = t.type({
  data: t.type({
    id: t.union([t.null, t.string]),
    deploymentName: t.union([t.null, t.string]),
    modelType: t.unknown,
    modelName: t.union([t.null, t.string]),
    mlFlowModel: t.union([t.null, t.string]),
    mlFlowVersion: t.union([t.null, t.number]),
    tags: t.array(t.string),
    configFilePath: t.union([t.null, t.string]),
    testDataPath: t.union([t.null, t.string]),
    modelArtifactPath: t.union([t.null, t.string]),
    compatibleAppVersions: t.array(
      t.type({
        appName: t.union([t.null, t.string]),
        codepushVersion: t.union([t.null, t.string]),
        id: t.union([t.null, t.string]),
        semver: t.union([t.null, t.string]),
        buildNumber: t.union([t.null, t.number]),
        createdAt: t.union([t.null, t.string]),
        lastUpdatedAt: t.union([t.null, t.string]),
        status: t.unknown,
      })
    ),
    eventTables: t.array(
      t.type({
        id: t.union([t.null, t.string]),
        tableName: t.string,
        expiryInSecs: t.union([t.null, t.number]),
        queries: t.array(t.string),
        eventData: t.type({
          eventName: t.string,
          type: t.unknown,
          props: t.array(
            t.type({
              defaultVal: t.string,
              propName: t.string,
              propNameMapping: t.string,
              sqlDataType: t.string,
            })
          ),
        }),
        version: t.union([t.null, t.string]),
      })
    ),
    featureGroupTables: t.union([
      t.null,
      t.array(
        t.union([
          t.null,
          t.type({
            featureGroupData: t.type({
              featureGroupName: t.string,
              features: t.array(
                t.type({
                  defaultVal: t.string,
                  featureName: t.string,
                  sqlDataType: t.string,
                })
              ),
            }),
            id: t.union([t.null, t.string]),
            queries: t.array(t.string),
            tableName: t.string,
          }),
        ])
      ),
    ]),
  }),
})

export const GetModelDeploymentForIdSchema = t.type({
  getModelDeploymentForId: t.union([
    t.null,
    t.type({
      data: t.type({
        id: t.union([t.null, t.string]),
        deploymentName: t.union([t.null, t.string]),
        modelType: t.unknown,
        modelName: t.union([t.null, t.string]),
        mlFlowModel: t.union([t.null, t.string]),
        mlFlowVersion: t.union([t.null, t.number]),
        tags: t.array(t.string),
        configFilePath: t.union([t.null, t.string]),
        testDataPath: t.union([t.null, t.string]),
        modelArtifactPath: t.union([t.null, t.string]),
        compatibleAppVersions: t.array(
          t.type({
            appName: t.union([t.null, t.string]),
            codepushVersion: t.union([t.null, t.string]),
            id: t.union([t.null, t.string]),
            semver: t.union([t.null, t.string]),
            buildNumber: t.union([t.null, t.number]),
            createdAt: t.union([t.null, t.string]),
            lastUpdatedAt: t.union([t.null, t.string]),
            status: t.unknown,
          })
        ),
        eventTables: t.array(
          t.type({
            id: t.union([t.null, t.string]),
            tableName: t.string,
            expiryInSecs: t.union([t.null, t.number]),
            queries: t.array(t.string),
            eventData: t.type({
              eventName: t.string,
              type: t.unknown,
              props: t.array(
                t.type({
                  defaultVal: t.string,
                  propName: t.string,
                  propNameMapping: t.string,
                  sqlDataType: t.string,
                })
              ),
            }),
            version: t.union([t.null, t.string]),
          })
        ),
        featureGroupTables: t.union([
          t.null,
          t.array(
            t.union([
              t.null,
              t.type({
                featureGroupData: t.type({
                  featureGroupName: t.string,
                  features: t.array(
                    t.type({
                      defaultVal: t.string,
                      featureName: t.string,
                      sqlDataType: t.string,
                    })
                  ),
                }),
                id: t.union([t.null, t.string]),
                queries: t.array(t.string),
                tableName: t.string,
              }),
            ])
          ),
        ]),
      }),
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
