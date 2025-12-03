import * as t from 'io-ts'

export const GetModelDeploymentsInputSchema = t.partial({
  filters: t.union([
    t.undefined,
    t.null,
    t.partial({
      name: t.union([t.undefined, t.null, t.string]),
      status: t.unknown,
      owners: t.union([t.undefined, t.null, t.array(t.string)]),
    }),
  ]),
  pageSize: t.union([t.undefined, t.null, t.number]),
  pageNumber: t.union([t.undefined, t.null, t.number]),
  sortBy: t.unknown,
  sortOrder: t.unknown,
})

export const SelectionOnCompatibleAppVersionsSchema = t.type({
  id: t.union([t.null, t.string]),
  semver: t.union([t.null, t.string]),
  codepushVersion: t.union([t.null, t.string]),
  buildNumber: t.union([t.null, t.number]),
  status: t.unknown,
  appName: t.union([t.null, t.string]),
  createdAt: t.union([t.null, t.string]),
  lastUpdatedAt: t.union([t.null, t.string]),
})

export const SelectionOnMlModelDeploymentsSchema = t.type({
  id: t.union([t.null, t.string]),
  deploymentName: t.union([t.null, t.string]),
  modelType: t.unknown,
  description: t.union([t.null, t.string]),
  modelName: t.union([t.null, t.string]),
  mlFlowModel: t.union([t.null, t.string]),
  mlFlowVersion: t.union([t.null, t.number]),
  tags: t.array(t.string),
  status: t.union([t.null, t.string]),
  owner: t.union([t.null, t.string]),
  lastUpdatedAt: t.union([t.null, t.string]),
  createdAt: t.union([t.null, t.string]),
  compatibleAppVersions: t.array(
    t.type({
      id: t.union([t.null, t.string]),
      semver: t.union([t.null, t.string]),
      codepushVersion: t.union([t.null, t.string]),
      buildNumber: t.union([t.null, t.number]),
      status: t.unknown,
      appName: t.union([t.null, t.string]),
      createdAt: t.union([t.null, t.string]),
      lastUpdatedAt: t.union([t.null, t.string]),
    })
  ),
})

export const SelectionOnDataSchema = t.type({
  totalDeployments: t.union([t.null, t.number]),
  pageNumber: t.union([t.null, t.number]),
  hasNextPage: t.union([t.null, t.literal(false), t.literal(true)]),
  mlModelDeployments: t.array(
    t.type({
      id: t.union([t.null, t.string]),
      deploymentName: t.union([t.null, t.string]),
      modelType: t.unknown,
      description: t.union([t.null, t.string]),
      modelName: t.union([t.null, t.string]),
      mlFlowModel: t.union([t.null, t.string]),
      mlFlowVersion: t.union([t.null, t.number]),
      tags: t.array(t.string),
      status: t.union([t.null, t.string]),
      owner: t.union([t.null, t.string]),
      lastUpdatedAt: t.union([t.null, t.string]),
      createdAt: t.union([t.null, t.string]),
      compatibleAppVersions: t.array(
        t.type({
          id: t.union([t.null, t.string]),
          semver: t.union([t.null, t.string]),
          codepushVersion: t.union([t.null, t.string]),
          buildNumber: t.union([t.null, t.number]),
          status: t.unknown,
          appName: t.union([t.null, t.string]),
          createdAt: t.union([t.null, t.string]),
          lastUpdatedAt: t.union([t.null, t.string]),
        })
      ),
    })
  ),
})

export const SelectionOnGetModelDeploymentsSchema = t.type({
  data: t.type({
    totalDeployments: t.union([t.null, t.number]),
    pageNumber: t.union([t.null, t.number]),
    hasNextPage: t.union([t.null, t.literal(false), t.literal(true)]),
    mlModelDeployments: t.array(
      t.type({
        id: t.union([t.null, t.string]),
        deploymentName: t.union([t.null, t.string]),
        modelType: t.unknown,
        description: t.union([t.null, t.string]),
        modelName: t.union([t.null, t.string]),
        mlFlowModel: t.union([t.null, t.string]),
        mlFlowVersion: t.union([t.null, t.number]),
        tags: t.array(t.string),
        status: t.union([t.null, t.string]),
        owner: t.union([t.null, t.string]),
        lastUpdatedAt: t.union([t.null, t.string]),
        createdAt: t.union([t.null, t.string]),
        compatibleAppVersions: t.array(
          t.type({
            id: t.union([t.null, t.string]),
            semver: t.union([t.null, t.string]),
            codepushVersion: t.union([t.null, t.string]),
            buildNumber: t.union([t.null, t.number]),
            status: t.unknown,
            appName: t.union([t.null, t.string]),
            createdAt: t.union([t.null, t.string]),
            lastUpdatedAt: t.union([t.null, t.string]),
          })
        ),
      })
    ),
  }),
})

export const GetModelDeploymentsSchema = t.type({
  getModelDeployments: t.union([
    t.null,
    t.type({
      data: t.type({
        totalDeployments: t.union([t.null, t.number]),
        pageNumber: t.union([t.null, t.number]),
        hasNextPage: t.union([t.null, t.literal(false), t.literal(true)]),
        mlModelDeployments: t.array(
          t.type({
            id: t.union([t.null, t.string]),
            deploymentName: t.union([t.null, t.string]),
            modelType: t.unknown,
            description: t.union([t.null, t.string]),
            modelName: t.union([t.null, t.string]),
            mlFlowModel: t.union([t.null, t.string]),
            mlFlowVersion: t.union([t.null, t.number]),
            tags: t.array(t.string),
            status: t.union([t.null, t.string]),
            owner: t.union([t.null, t.string]),
            lastUpdatedAt: t.union([t.null, t.string]),
            createdAt: t.union([t.null, t.string]),
            compatibleAppVersions: t.array(
              t.type({
                id: t.union([t.null, t.string]),
                semver: t.union([t.null, t.string]),
                codepushVersion: t.union([t.null, t.string]),
                buildNumber: t.union([t.null, t.number]),
                status: t.unknown,
                appName: t.union([t.null, t.string]),
                createdAt: t.union([t.null, t.string]),
                lastUpdatedAt: t.union([t.null, t.string]),
              })
            ),
          })
        ),
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
