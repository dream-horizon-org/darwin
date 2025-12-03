import {createModelDeployment} from './createModelDeployment'
import {deleteModelDeploymentForId} from './deleteModelDeployment'
import {getAppVersions} from './getAppVersions'
import {getEventSchema} from './getEventSchema'
import {getFileContents} from './getFileContents'
import {getMLFlowModelArtifactUrl} from './getMLFlowModelArtifactUrl'
import {getMLFlowModelVersions} from './getMLFlowModelVersions'
import {getMLFlowRegisteredModels} from './getMLFlowRegisteredModels'
import {getModelDeploymentForId} from './getModelDeploymentForId'
import {getModelDeployments} from './getModelDeployments'
import {publishDeployment} from './publishDeployment'
import {triggerCiForDeployment} from './triggerCiForDeployment'
import {updateModelDeployment} from './updateModelDeployment'
import {validateEdgeTableName} from './validateEdgeTableName'
import {validateModelDeploymentName} from './validateModelDeploymentName'

export const queries = {
  getModelDeployments,
  getModelDeploymentForId,
  validateModelDeploymentName,
  validateEdgeTableName,
  getMLFlowRegisteredModels,
  getMLFlowModelVersions,
  getMLFlowModelArtifactUrl,
  getEventSchema,
  getAppVersions,
}
export const mutations = {
  deleteModelDeploymentForId,
  createModelDeployment,
  triggerCiForDeployment,
  publishDeployment,
  updateModelDeployment,
  getFileContents,
}
