const DataLoader = require('dataloader')
import { config } from '../../lib/config'
import * as R from 'ramda'
import {
  getAppLayerServiceNameForMLFlow,
  getAppLayerServiceNameForModelDeployments,
  getAppLayerServiceNameForWorkspace,
} from '../../utils/utils'
const modelDeploymentService = getAppLayerServiceNameForModelDeployments()
const mlflowService = getAppLayerServiceNameForMLFlow()
const workspaceServiceName = getAppLayerServiceNameForWorkspace()
export const getModelDeploymentsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        let url = `/v1/admin/model-deployments`
        if (arg && arg !== '{}') {
          const formattedArgs = JSON.parse(arg)
          formattedArgs.filters = JSON.stringify(formattedArgs.filters)
          const urlParams = new URLSearchParams(formattedArgs).toString()
          url = `/v1/admin/model-deployments?${urlParams}`
        }
        return io.HTTP.get(
          `${url}`,
          R.merge({service: modelDeploymentService}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getModelDeploymentForIdLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArg = JSON.parse(arg as any)
        return io.HTTP.get(
          `/v1/admin/model-deployments/${parsedArg.deploymentId}`,
          R.merge({service: modelDeploymentService}, request.headers),
          parsedArg
        )
      })
  )

export const getFileContentsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArg = JSON.parse(arg as any)
        return io.HTTP.post(
          `/file_content`,
          R.merge({service: workspaceServiceName}, request.headers),
          parsedArg
        )
      })
  )

export const deleteModelDeploymentForIdLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.delete(
          `/v1/admin/model-deployments/${arg.deploymentId}`,
          R.merge({service: modelDeploymentService}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const createModelDeploymentLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((_) => {
        const formattedArgs = JSON.parse(args as any)
        if (formattedArgs.eventTables) {
          formattedArgs.eventTables = formattedArgs.eventTables.map(
            (eventTable) => {
              return eventTable.eventData.props.map((prop) => {
                if (prop.sqlDataType.toLowerCase() === 'integer') {
                  prop.defaultVal = parseInt(prop.defaultVal)
                } else if (prop.sqlDataType.toLowerCase() === 'float') {
                  prop.defaultVal = parseFloat(prop.defaultVal)
                } else if (prop.sqlDataType.toLowerCase() === 'boolean') {
                  prop.defaultVal = prop.defaultVal === 'true'
                } else if (prop.sqlDataType.toLowerCase() === 'long') {
                  prop.defaultVal = parseInt(prop.defaultVal)
                }
                return prop
              })
            }
          )
        }
        return io.HTTP.post(
          `/v1/admin/model-deployments`,
          R.merge({service: modelDeploymentService}, request.headers),
          JSON.parse(args as any)
        )
      })
  )

export const updateModelDeploymentLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArg = JSON.parse(arg as any)
        return io.HTTP.put(
          `/v1/admin/model-deployments/${parsedArg.id}`,
          R.merge({service: modelDeploymentService}, request.headers),
          JSON.parse(args as any)
        )
      })
  )

export const validateModelDeploymentNameLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        let url = `/v1/admin/model-deployments/check-deployment-name`
        const formattedArgs = JSON.parse(arg)
        if (formattedArgs.deploymentName) {
          url = `/v1/admin/model-deployments/check-deployment-name?name=${formattedArgs.deploymentName}`
        }
        return io.HTTP.get(
          `${url}`,
          R.merge({service: modelDeploymentService}, request.headers),
          formattedArgs
        )
      })
  )

export const validateEdgeTableNameLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        let url = `/v1/admin/validate-table-name`
        const formattedArgs = JSON.parse(arg)
        url = `/v1/admin/validate-table-name?tableName=${formattedArgs.tableName ||
          ''}`

        return io.HTTP.get(
          `${url}`,
          R.merge({service: modelDeploymentService}, request.headers),
          formattedArgs
        )
      })
  )

export const getMLFlowRegisteredModelsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((_) => {
        request.headers = {
          ...request.headers,
          Authorization: config.ML_FLOW_AUTH_TOKEN,
        }
        return io.HTTP.get(
          `/ajax-api/2.0/mlflow/registered-models/search`,
          R.merge({service: mlflowService}, request.headers),
          {}
        )
      })
  )

export const getMLFlowModelVersionsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArg = JSON.parse(arg as any)
        request.headers = {
          ...request.headers,
          Authorization: config.ML_FLOW_AUTH_TOKEN,
        }
        return io.HTTP.get(
          `/ajax-api/2.0/mlflow/model-versions/search?filter=name%3D'${parsedArg.modelName}'`,
          R.merge({service: mlflowService}, request.headers),
          {}
        )
      })
  )

export const getMLFlowModelArtifactUrlLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArg = JSON.parse(arg as any)
        request.headers = {
          ...request.headers,
          Authorization: config.ML_FLOW_AUTH_TOKEN,
        }
        return io.HTTP.get(
          `/ajax-api/2.0/mlflow/artifacts/list?run_id=${parsedArg.runId}`,
          R.merge({service: mlflowService}, request.headers),
          {}
        )
      })
  )

export const getEventSchemaLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArg = JSON.parse(arg as any)
        return io.HTTP.get(
          `/v1/admin/get-event-schema?appVersionId=${parsedArg.appVersionId}`,
          R.merge({service: modelDeploymentService}, request.headers),
          parsedArg
        )
      })
  )

export const getAppVersionsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/v1/admin/app-versions`,
          R.merge({service: modelDeploymentService}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const triggerCiForDeploymentLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArg = JSON.parse(arg as any)
        const {modelDeploymentId, appVersion} = parsedArg
        return io.HTTP.post(
          `/v1/admin/model-deployments/${modelDeploymentId}/trigger-ci`,
          R.merge({service: modelDeploymentService}, request.headers),
          {appVersionIds: appVersion}
        )
      })
  )

export const publishDeploymentLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArg = JSON.parse(arg as any)
        const {modelDeploymentId, appVersion} = parsedArg
        return io.HTTP.post(
          `/v1/admin/model-deployments/${modelDeploymentId}/publish`,
          R.merge({service: modelDeploymentService}, request.headers),
          {appVersionIds: appVersion}
        )
      })
  )

export const getModelTablesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArg = JSON.parse(arg as any)
        const {modelDeploymentId} = parsedArg
        return io.HTTP.get(
          `/model-deployments/${modelDeploymentId}/event-tables`,
          R.merge({service: modelDeploymentService}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const loaders = {
  getModelDeploymentsLoader,
  getModelDeploymentForIdLoader,
  getFileContentsLoader,
  createModelDeploymentLoader,
  deleteModelDeploymentForIdLoader,
  validateModelDeploymentNameLoader,
  validateEdgeTableNameLoader,
  getMLFlowRegisteredModelsLoader,
  getMLFlowModelVersionsLoader,
  getMLFlowModelArtifactUrlLoader,
  getEventSchemaLoader,
  getAppVersionsLoader,
  triggerCiForDeploymentLoader,
  publishDeploymentLoader,
  updateModelDeploymentLoader,
  getModelTablesLoader,
}
