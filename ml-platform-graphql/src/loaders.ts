import DataLoader = require('dataloader')
import * as R from 'ramda'
import {loaders as computeLoader} from './loaders/compute'
import {
  camelToSnakeCaseObjectWithExclusions,
  camelToSnakeObject,
  getAppLayerServiceNameForCatalog,
  getAppLayerServiceNameForCompute,
  getAppLayerServiceNameForWorkflows,
  getAppLayerServiceNameForWorkspace,
} from './utils/utils'

import {loaders as bringYourOwnRuntimeLoaders} from './loaders/bring-your-own-runtime'

const computeServiceName = getAppLayerServiceNameForCompute()
const workspaceServiceName = getAppLayerServiceNameForWorkspace()
const workflowServiceName = getAppLayerServiceNameForWorkflows()
const catalogServiceName = getAppLayerServiceNameForCatalog()
import {loaders as modelDeploymentLoaders} from './loaders/model-deployments'
import {loaders as workspaceLoaders} from './loaders/workspace'
export const fetchAllFeatureJobsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/mlp/feature-job/v0/`,
          R.merge({service: 'FEATURE_STORE'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const fetchAllFiltersLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/fct/get-tags-owners`,
          R.merge({service: 'FEATURE_STORE_V2'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const fetchCountOfJobsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/mlp/feature-job/v0/count-all-jobs`,
          R.merge({service: 'FEATURE_STORE'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const fetchFeatureJobsByIdLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/mlp/feature-job/v0/id`,
          R.merge({service: 'FEATURE_STORE'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const fetchFeatureJobLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/mlp/feature-job/v0/id`,
          R.merge({service: 'FEATURE_STORE'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const fetchScheduleJobRunsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/mlp/feature-job/v0/job-runs`,
          R.merge({service: 'FEATURE_STORE'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const fetchFeatureJobByIdLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/mlp/feature-job/v0/id`,
          R.merge({service: 'FEATURE_STORE'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

const fetchFeatureGroupLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const fetchFeatureGroupArgs = JSON.parse(arg as any)
        return io.HTTP.get(
          `/fct/feature-group-details/${fetchFeatureGroupArgs.featureGroupName}`,
          R.merge({service: 'FEATURE_STORE_V2'}, request.headers),
          {version: fetchFeatureGroupArgs.version}
        )
      })
  )

const fetchFeatureGroupVersionsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/fct/version-history`,
          R.merge({service: 'FEATURE_STORE_V2'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const fetchFilteredFeatureGroupsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/fct/search`,
          R.merge(
            {
              service: 'FEATURE_STORE_V2',
            },
            request.headers
          ),
          JSON.parse(arg as any)
        )
      })
  )

export const fetchComputeTagsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/get-tags`,
          R.merge({service: computeServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const searchComputeClustersLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = {
          query: parsedArgs.searchQuery,
          filters: parsedArgs.filters,
          page_size: parsedArgs.pageSize,
          offset: parsedArgs.offset,
          sort_by: parsedArgs.sortBy,
          sort_order: parsedArgs.sortOrder,
        }
        return io.HTTP.post(
          `/search`,
          R.merge({service: computeServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const createComputeClusterLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeCaseObjectWithExclusions(parsedArgs, [
          'spark_config',
        ])
        return io.HTTP.post(
          `/cluster`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          formatedArgs['input']
        )
      })
  )

export const predictClusterCostLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        let parsedArgs = JSON.parse(args as any)
        parsedArgs = parsedArgs.input
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/cluster/cost/predict`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          formatedArgs
        )
      })
  )

export const updateComputeClusterLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeCaseObjectWithExclusions(
          parsedArgs.input.data,
          ['spark_config']
        )
        return io.HTTP.put(
          `/cluster/${parsedArgs.input.clusterId}`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          formatedArgs
        )
      })
  )

export const getComputeClusterLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.get(
          `/cluster/${parsedArgs.clusterId}`,
          R.merge({service: computeServiceName}, request.headers),
          parsedArgs
        )
      })
  )

export const getComputeRuntimeListLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/get-runtimes`,
          R.merge({service: computeServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getComputeRuntimeLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/runtime/v2/get-all`,
          R.merge({service: computeServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getComputeRuntimeDetailsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        let sanitizedRuntime = formatedArgs.runtime
        if (sanitizedRuntime.includes('.')) {
          sanitizedRuntime = encodeURIComponent(sanitizedRuntime).replace(
            /\./g,
            '%2E'
          )
        }
        return io.HTTP.get(
          `/runtime/v2/get-details/${sanitizedRuntime}`,
          R.merge({service: computeServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getComputeInstanceRolesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/get-instance-role`,
          R.merge({service: computeServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getComputeDiscTypesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/get-disk-types`,
          R.merge({service: computeServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getComputeTemplatesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/get-templates`,
          R.merge({service: computeServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getComputeAvailabilityZonesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/get-az`,
          R.merge({service: computeServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const stopClusterLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.post(
          `/cluster/stop-cluster/${parsedArgs.input.cluster_id}`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          JSON.parse(arg as any)
        )
      })
  )

export const deleteClusterLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.delete(
          `/cluster/${parsedArgs.input.cluster_id}`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          JSON.parse(arg as any)
        )
      })
  )

export const deleteJobClusterDefinitionLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.delete(
          `/job-cluster-definitions/${parsedArgs.input.cluster_id}`,
          R.merge(
            {
              service: workflowServiceName,
            },
            request.headers
          ),
          JSON.parse(arg as any)
        )
      })
  )

export const startClusterLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.post(
          `/cluster/start-cluster/${parsedArgs.input.cluster_id}`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          JSON.parse(arg as any)
        )
      })
  )

export const reStartClusterLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.post(
          `/cluster/restart-cluster/${parsedArgs.input.cluster_id}`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          JSON.parse(arg as any)
        )
      })
  )

export const updateComputeClusterNameLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs.input.data)
        return io.HTTP.put(
          `/cluster/update-name/${parsedArgs.input.clusterId}`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          formatedArgs
        )
      })
  )

export const updateComputeClusterTagsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs.input.data)
        return io.HTTP.put(
          `/cluster/update-tags/${parsedArgs.input.clusterId}`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          formatedArgs
        )
      })
  )

export const getActionGroupsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = {
          page_size: parsedArgs.pageSize,
          offset: parsedArgs.offset,
          sort_order: parsedArgs.sortOrder,
        }
        return io.HTTP.get(
          `/cluster/get-action-groups/${parsedArgs.clusterId}`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          formatedArgs
        )
      })
  )

export const getActionGroupDetailsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = {
          sort_order: parsedArgs.sortOrder,
        }
        return io.HTTP.get(
          `/cluster/get-action-group-details/${parsedArgs.clusterRuntimeId}`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          formatedArgs
        )
      })
  )

export const getComputeLimitsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/get-limits`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          JSON.parse(arg as any)
        )
      })
  )

export const getComputeNodeTypesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/node-types`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          JSON.parse(arg as any)
        )
      })
  )

export const getProjectsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/get-projects`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getCodespacesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/get-codespaces`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const checkUniqueProjectNameLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/check-unique-project-name`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const checkUniqueGithubLinkLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/check-unique-github-link`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const checkUniqueCodespaceNameLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/check-unique-codespace-name`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getLastSelectedCodespaceLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/get-last-selected-codespace/v2`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const detachClusterLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.put(
          `/detach-cluster/v2`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const launchCodespaceLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/launch-codespace/v2`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getLastSyncedTimeLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/get-last-synced-time-for-codespace`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const createProjectLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/create-project/v2`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const importProjectLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/import-project`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const attachClusterLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.put(
          `/attach-cluster/v2`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const createCodespaceLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/create-codespace/v2`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getAllClustersLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/get-all-clusters`,
          R.merge({service: workspaceServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const launchImportedProjectLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/launch-imported-project`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getDataSourceEnvironmentsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/environments`,
          R.merge({service: 'DARWIN_DATA_CATALOG'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getDataSourceSourcesForEnvironmentLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.get(
          `/environments/${parsedArgs.env}/sources`,
          R.merge({service: 'DARWIN_DATA_CATALOG'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getDataForEnvironmentAndSourceLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.get(
          `/environments/${parsedArgs.env}/sources/${parsedArgs.source}/databases/${parsedArgs.database}`,
          R.merge({service: 'DARWIN_DATA_CATALOG'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getDatabasesForEnvironmentAndSourceLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.get(
          `/environments/${parsedArgs.env}/sources/${parsedArgs.source}`,
          R.merge({service: 'DARWIN_DATA_CATALOG'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getSampleDataForDataSourceLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) =>
        io.HTTP.post(
          `/getSampleData`,
          R.merge({service: 'DARWIN_DATA_CATALOG'}, request.headers),
          JSON.parse(arg as any)
        )
      )
  )

export const getClusterResourcesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/cluster-resources`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const deleteProjectLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.delete(
          `/delete-project/v2`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const deleteCodespaceLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.delete(
          `/delete-codespace/v2`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getCountOfProjectsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/get-count-of-projects`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const editCodespaceLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/edit-codespace/v2`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const editProjectLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/edit-project/v2`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getFeatureGroupsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/FeatureStore/get-feature-groups`,
          R.merge({service: 'MLP_FEATURE_STORE'}, request.headers),
          formatedArgs
        )
      })
  )

export const getFeatureGroupFiltersLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/FeatureStore/group-filters`,
          R.merge({service: 'MLP_FEATURE_STORE'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getFeatureGroupDetailsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/FeatureStore/get-feature-group`,
          R.merge({service: 'MLP_FEATURE_STORE'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getFeaturesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.get(
          `/FeatureStore/get-feature-of-feature-group`,
          R.merge({service: 'MLP_FEATURE_STORE'}, request.headers),
          formatedArgs
        )
      })
  )

export const getFeatureGroupRunsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/FeatureStore/feature-group-runs`,
          R.merge({service: 'MLP_FEATURE_STORE'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getFeatureCopyCodesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/FeatureStore/copy-code/features`,
          R.merge({service: 'MLP_FEATURE_STORE'}, request.headers),
          formatedArgs
        )
      })
  )

export const getFeatureUsageGraphLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/feature-usage-graph`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getProdUsageListLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/feature-prod-usage`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const expandDataSourceLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/expand-data-source`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getSourceTableDetailsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/get-source-table`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getFeatureGroupEntitiesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.get(
          `/FeatureStore/feature-groups/${formatedArgs.feature_group_name}/entities`,
          R.merge({service: 'MLP_FEATURE_STORE'}, request.headers),
          formatedArgs
        )
      })
  )

export const getFeatureGroupsCountLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/FeatureStore/feature-groups/count`,
          R.merge({service: 'MLP_FEATURE_STORE'}, request.headers),
          formatedArgs
        )
      })
  )

export const getComputeGpuPodsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/gpu-pods`,
          R.merge(
            {
              service: computeServiceName,
            },
            request.headers
          ),
          JSON.parse(arg as any)
        )
      })
  )

export const getComputeLibrariesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.get(
          `/cluster/${formatedArgs.cluster_id}/library`,
          R.merge({service: computeServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getComputeLibraryDetailsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.get(
          `/cluster/${formatedArgs.cluster_id}/library/${formatedArgs.library_id}`,
          R.merge({service: computeServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getComputeLibraryStatusLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(arg as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.get(
          `/cluster/${formatedArgs.cluster_id}/library/${formatedArgs.library_id}/status`,
          R.merge({service: computeServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const uninstallLibraryLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.put(
          `/cluster/${formatedArgs.input.cluster_id}/library/uninstall`,
          R.merge({service: computeServiceName}, request.headers),
          formatedArgs.input
        )
      })
  )

export const installLibraryLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/cluster/${formatedArgs.cluster_id}/library/install/batch`,
          R.merge({service: computeServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const retryInstallLibraryLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.patch(
          `/cluster/${parsedArgs.input.cluster_id}/library/${parsedArgs.input.library_id}/install/retry`,
          R.merge({service: computeServiceName}, request.headers),
          {}
        )
      })
  )

export const getMavenPackagesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.get(
          `/maven/package`,
          R.merge({service: computeServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getMavenPackageVersionsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        const encodedGroupId = encodeURIComponent(
          formatedArgs.group_id
        ).replace(/\./g, '%2E')
        const encodedArtifactId = encodeURIComponent(
          formatedArgs.artifact_id
        ).replace(/\./g, '%2E')
        return io.HTTP.get(
          `/maven/package/group/${encodedGroupId}/artifact/${encodedArtifactId}`,
          R.merge({service: computeServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getRecentlyVisitedWorkflowsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/recently_visited`,
          R.merge({service: workflowServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getWorkflowsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/workflows`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getWorkflowsAttachedToClusterLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.get(
          `/workflows`,
          R.merge({service: workflowServiceName}, request.headers),
          parsedArgs
        )
      })
  )

export const pauseWorkflowScheduleLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.put(
          `/pause_schedule/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const resumeWorkflowScheduleLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.put(
          `/resume_schedule/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const stopWorkflowRunLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.put(
          `/stop_run/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const runWorkflowRunLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeCaseObjectWithExclusions(parsedArgs, [
          'parameters',
        ])
        return io.HTTP.put(
          `/run_now/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const deleteWorkflowLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.delete(
          `/workflow/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getWorkflowFiltersLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/filters`,
          R.merge({service: workflowServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getWorkflowDetailsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.get(
          `/workflow/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getWorkflowsMetaDataLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/v2/meta_data`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getWorkflowRunsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/v2/runs/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getWorkflowRunDetailsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/v2/run_details/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getWorkflowRunCodeLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.get(
          `/run_code/${formatedArgs.workflow_id}/${formatedArgs.run_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getWorkflowTaskDetailsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/v3/task_details/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getWorkflowPathDetailsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/get-codespace-path-project-and-codespace`,
          R.merge({service: workspaceServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getWorkflowTaskDetailsWithoutRunLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/task_details_without_run/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getWorkflowYamlLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.get(
          `/yaml/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const updateWorkflowRetriesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.put(
          `/retries/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const updateWorkflowMaxConcurrentRunsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const formatedArgs = camelToSnakeObject(JSON.parse(args as any))
        return io.HTTP.put(
          `/max_concurrent_runs/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const updateWorkflowScheduleLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const formatedArgs = camelToSnakeObject(JSON.parse(args as any))
        return io.HTTP.put(
          `/schedule/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const updateWorkflowTagsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const formatedArgs = camelToSnakeObject(JSON.parse(args as any))
        return io.HTTP.put(
          `/tags/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getAllJobClustersLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const formatedArgs = camelToSnakeObject(JSON.parse(args as any))
        return io.HTTP.get(
          `/job-cluster-definitions`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getAllJobClustersV2Loader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const formatedArgs = camelToSnakeObject(JSON.parse(args as any))
        return io.HTTP.post(
          `/v2/job-cluster-definitions`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const checkUniqueWorkflowLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          '/check_unique_workflow_name',
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const createWorkflowLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeCaseObjectWithExclusions(
          parsedArgs.input,
          ['parameters', 'inputParameters']
        )
        return io.HTTP.post(
          '/workflow',
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const updateWorkflowLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeCaseObjectWithExclusions(
          parsedArgs.input,
          ['parameters', 'inputParameters']
        )
        return io.HTTP.put(
          `/workflow/${parsedArgs.workflowId}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const workspacesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          '/workspaces',
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const codespaceFoldersLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          '/folder-contents',
          R.merge({service: workspaceServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const createJobClusterDefinitionLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeCaseObjectWithExclusions(parsedArgs, [
          'spark_config',
        ])
        return io.HTTP.post(
          `/job-cluster-definition`,
          R.merge(
            {
              service: workflowServiceName,
            },
            request.headers
          ),
          formatedArgs['input']
        )
      })
  )

export const updateJobClusterDefinitionLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeCaseObjectWithExclusions(
          parsedArgs.input,
          ['spark_config']
        )
        return io.HTTP.put(
          `/job-cluster-definition/${parsedArgs.clusterId}`,
          R.merge(
            {
              service: workflowServiceName,
            },
            request.headers
          ),
          formatedArgs
        )
      })
  )

export const jobClusterDefinitionLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.get(
          `/job-cluster-definitions/${parsedArgs.jobClusterDefinitionId}`,
          R.merge({service: workflowServiceName}, request.headers),
          parsedArgs
        )
      })
  )

export const checkUniqueJobClusterNameLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          '/check-unique-job-cluster',
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getSparkHistoryServerLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.get(
          `/spark-history-server/resource/${parsedArgs.resource_id}`,
          R.merge({service: computeServiceName}, request.headers),
          parsedArgs
        )
      })
  )

export const startSparkHistoryServerLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          '/spark-history-server',
          R.merge({service: computeServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const createExperimentationUserLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          '/v1/user',
          R.merge({service: 'MLP_EXPERIMENTATION'}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const repairWorkflowRunLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)

        return io.HTTP.post(
          `/v1/repair_run/${formatedArgs.workflow_id}`,
          R.merge({service: workflowServiceName}, request.headers),
          formatedArgs
        )
      })
  )

export const getCatalogAssetsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)

        const {offset, page_size, ...bodyArgs} = formatedArgs

        // Build query string
        const queryParams = new URLSearchParams()
        if (offset !== undefined)
          queryParams.append('offset', offset.toString())
        if (page_size !== undefined)
          queryParams.append('page_size', page_size.toString())

        const queryString = queryParams.toString()
        const url = queryString ? `/v1/assets?${queryString}` : '/v1/assets'

        return io.HTTP.post(
          url,
          R.merge({service: catalogServiceName}, request.headers),
          bodyArgs
        )
      })
  )

export const searchAssetsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(arg as any)
        const formatedArgs = camelToSnakeObject(parsedArgs)

        // Extract path parameters
        const {depth, offset, page_size, ...bodyArgs} = formatedArgs

        // Build query string
        const queryParams = new URLSearchParams()
        if (depth !== undefined) queryParams.append('depth', depth.toString())
        if (offset !== undefined)
          queryParams.append('offset', offset.toString())
        if (page_size !== undefined)
          queryParams.append('page_size', page_size.toString())

        const queryString = queryParams.toString()
        const url = queryString ? `/v1/search?${queryString}` : '/search'

        return io.HTTP.post(
          url,
          R.merge({service: catalogServiceName}, request.headers),
          bodyArgs
        )
      })
  )

const getAllPurposeClustersLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        parsedArgs['is_job_cluster'] = false
        return io.HTTP.post(
          `/search`,
          R.merge({service: computeServiceName}, request.headers),
          parsedArgs
        )
      })
  )

export const getLineageAssetLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(arg as any)
        return io.HTTP.get(
          `/v1/assets/${parsedArgs.assetName}/lineage`,
          R.merge({service: catalogServiceName}, request.headers),
          {}
        )
      })
  )

export const loaders = {
  fetchAllFeatureJobsLoader,
  fetchAllFiltersLoader,
  fetchCountOfJobsLoader,
  fetchFilteredFeatureGroupsLoader,
  fetchFeatureJobsByIdLoader,
  fetchFeatureJobLoader,
  fetchScheduleJobRunsLoader,
  fetchFeatureJobByIdLoader,
  fetchFeatureGroupLoader,
  fetchFeatureGroupVersionsLoader,
  fetchComputeTagsLoader,
  searchComputeClustersLoader,
  createComputeClusterLoader,
  predictClusterCostLoader,
  updateComputeClusterLoader,
  getComputeClusterLoader,
  getComputeRuntimeListLoader,
  getComputeRuntimeLoader,
  getComputeRuntimeDetailsLoader,
  getComputeInstanceRolesLoader,
  getComputeDiscTypesLoader,
  getComputeTemplatesLoader,
  getComputeAvailabilityZonesLoader,
  stopClusterLoader,
  deleteClusterLoader,
  deleteJobClusterDefinitionLoader,
  startClusterLoader,
  reStartClusterLoader,
  updateComputeClusterNameLoader,
  updateComputeClusterTagsLoader,
  getActionGroupsLoader,
  getActionGroupDetailsLoader,
  getProjectsLoader,
  getCodespacesLoader,
  checkUniqueProjectNameLoader,
  checkUniqueGithubLinkLoader,
  checkUniqueCodespaceNameLoader,
  getLastSelectedCodespaceLoader,
  detachClusterLoader,
  getLastSyncedTimeLoader,
  launchCodespaceLoader,
  createProjectLoader,
  importProjectLoader,
  attachClusterLoader,
  createCodespaceLoader,
  getAllClustersLoader,
  launchImportedProjectLoader,
  getComputeLimitsLoader,
  getDataSourceEnvironmentsLoader,
  getDataSourceSourcesForEnvironmentLoader,
  getDataForEnvironmentAndSourceLoader,
  getDatabasesForEnvironmentAndSourceLoader,
  getSampleDataForDataSourceLoader,
  getClusterResourcesLoader,
  deleteProjectLoader,
  deleteCodespaceLoader,
  getCountOfProjectsLoader,
  editCodespaceLoader,
  editProjectLoader,
  getFeatureGroupsLoader,
  getFeatureGroupFiltersLoader,
  getFeatureGroupDetailsLoader,
  getFeaturesLoader,
  getFeatureGroupRunsLoader,
  getFeatureCopyCodesLoader,
  getFeatureUsageGraphLoader,
  getProdUsageListLoader,
  expandDataSourceLoader,
  getSourceTableDetailsLoader,
  getFeatureGroupEntitiesLoader,
  getFeatureGroupsCountLoader,
  getComputeNodeTypesLoader,
  getComputeGpuPodsLoader,
  getComputeLibraryDetailsLoader,
  getComputeLibraryStatusLoader,
  uninstallLibraryLoader,
  installLibraryLoader,
  retryInstallLibraryLoader,
  getMavenPackagesLoader,
  getMavenPackageVersionsLoader,
  getComputeLibrariesLoader,
  getRecentlyVisitedWorkflowsLoader,
  getWorkflowsLoader,
  pauseWorkflowScheduleLoader,
  resumeWorkflowScheduleLoader,
  stopWorkflowRunLoader,
  runWorkflowRunLoader,
  deleteWorkflowLoader,
  getWorkflowFiltersLoader,
  getWorkflowPathDetailsLoader,
  getWorkflowDetailsLoader,
  getWorkflowsMetaDataLoader,
  getWorkflowRunsLoader,
  getWorkflowRunDetailsLoader,
  getWorkflowRunCodeLoader,
  getWorkflowTaskDetailsWithoutRunLoader,
  getWorkflowTaskDetailsLoader,
  ...bringYourOwnRuntimeLoaders,
  getWorkflowYamlLoader,
  ...computeLoader,
  ...workspaceLoaders,
  updateWorkflowRetriesLoader,
  updateWorkflowMaxConcurrentRunsLoader,
  updateWorkflowScheduleLoader,
  updateWorkflowTagsLoader,
  getAllJobClustersLoader,
  getAllJobClustersV2Loader,
  checkUniqueWorkflowLoader,
  createWorkflowLoader,
  updateWorkflowLoader,
  workspacesLoader,
  codespaceFoldersLoader,
  createJobClusterDefinitionLoader,
  updateJobClusterDefinitionLoader,
  jobClusterDefinitionLoader,
  checkUniqueJobClusterNameLoader,
  getSparkHistoryServerLoader,
  startSparkHistoryServerLoader,
  createExperimentationUserLoader,
  repairWorkflowRunLoader,
  ...modelDeploymentLoaders,
  getCatalogAssetsLoader,
  searchAssetsLoader,
  getAllPurposeClustersLoader,
  getWorkflowsAttachedToClusterLoader,
  getLineageAssetLoader,
}
