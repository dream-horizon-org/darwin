import {
  CLEAR_EDGE_MODEL_DATA,
  DELETE_EVENT_TABLE_DATA,
  DELETE_EVENT_TABLE_PROP,
  DELETE_FEATURE_GROUP_TABLE_DATA,
  DELETE_FEATURE_GROUP_TABLE_FEATURE,
  INSERT_EVENT_TABLE_DATA,
  INSERT_FEATURE_GROUP_TABLE_DATA,
  SET_COMPATIBLE_APP_VERSIONS,
  SET_CONFIG_FILE_CONTENT,
  SET_CONFIG_FILE_DATA,
  SET_DEPLOYMENT_TAGS,
  SET_EDITABLE_FIELDS,
  SET_EVENT_TABLE_DATA,
  SET_FEATURE_GROUPS,
  SET_FEATURE_GROUP_TABLE_DATA,
  SET_INITIAL_EVENT_TABLE_DATA,
  SET_INITIAL_FEATURE_GROUP_TABLE_DATA,
  SET_MLFLOW_MODEL_DETAILS,
  SET_MLFLOW_MODEL_VERSIONS,
  SET_MLFLOW_REGISTERED_MODELS,
  SET_TEST_DATA_FILE_DATA,
  SET_TEST_FILE_CONTENT,
  SET_VALIDATE_MODEL_DEPLOYMENT_NAME,
  UPDATE_EVENT_TABLE_DATA,
  UPDATE_FEATURE_GROUP_TABLE_DATA
} from './constants.redux'
import {IEdgeModelsState} from './reducer'
import {
  TEventData,
  TEventTables,
  TFeatureData,
  TFeatureGroupData,
  TFeatureGroupTables
} from './types'

export function setValidateModelDeploymentName(
  payload: IEdgeModelsState['isModelNameValid']
) {
  return {
    type: SET_VALIDATE_MODEL_DEPLOYMENT_NAME,
    payload
  }
}

export const setDeploymentTags = (tags: string[]) => {
  return {
    type: SET_DEPLOYMENT_TAGS,
    payload: tags
  }
}

export const setConfiFileData = (configFilePath: string) => {
  return {
    type: SET_CONFIG_FILE_DATA,
    payload: configFilePath
  }
}

export const setTestDataFileData = (testDataFilePath: string) => {
  return {
    type: SET_TEST_DATA_FILE_DATA,
    payload: testDataFilePath
  }
}

export const setMLFlowRegisteredModels = (
  payload: IEdgeModelsState['mlFlowRegisteredModels']
) => {
  return {
    type: SET_MLFLOW_REGISTERED_MODELS,
    payload
  }
}

export const setMLFlowModelVersions = (
  payload: IEdgeModelsState['mlFlowModelVersions']
) => {
  return {
    type: SET_MLFLOW_MODEL_VERSIONS,
    payload
  }
}

export const setMLFlowModelDetails = (
  payload: IEdgeModelsState['mlFlowModelDetails']
) => {
  return {
    type: SET_MLFLOW_MODEL_DETAILS,
    payload
  }
}

export const setEventTableData = (payload: TEventTables) => {
  return {
    type: SET_EVENT_TABLE_DATA,
    payload
  }
}

export const setInitialEventTableData = (payload: TEventTables) => {
  return {
    type: SET_INITIAL_EVENT_TABLE_DATA,
    payload
  }
}

export const updateEventTableData = (payload: TEventData) => {
  return {
    type: UPDATE_EVENT_TABLE_DATA,
    payload
  }
}

export const insertEventTableData = (payload: TEventData) => {
  return {
    type: INSERT_EVENT_TABLE_DATA,
    payload
  }
}

export const deleteEventTableData = (payload: string) => {
  return {
    type: DELETE_EVENT_TABLE_DATA,
    payload
  }
}

export const deleteEventTableProp = (payload: {
  tableName: string
  propName: string
}) => {
  return {
    type: DELETE_EVENT_TABLE_PROP,
    payload
  }
}

export const clearEdgeModelGlobalState = () => {
  return {
    type: CLEAR_EDGE_MODEL_DATA,
    payload: {}
  }
}

export const setCompatibleAppVersions = (payload: number[]) => {
  return {
    type: SET_COMPATIBLE_APP_VERSIONS,
    payload
  }
}

export const setEditableObject = (payload: IEdgeModelsState['isEditable']) => {
  return {
    type: SET_EDITABLE_FIELDS,
    payload
  }
}

export const setFeatureTableData = (payload: TFeatureGroupTables) => {
  return {
    type: SET_FEATURE_GROUP_TABLE_DATA,
    payload
  }
}

export const setInitialFeatureTableData = (payload: TFeatureGroupTables) => {
  return {
    type: SET_INITIAL_FEATURE_GROUP_TABLE_DATA,
    payload
  }
}

export const updateFeatureTableData = (payload: TFeatureGroupData) => {
  return {
    type: UPDATE_FEATURE_GROUP_TABLE_DATA,
    payload
  }
}

export const insertFeatureTableData = (payload: TFeatureGroupData) => {
  return {
    type: INSERT_FEATURE_GROUP_TABLE_DATA,
    payload
  }
}

export const deleteFeatureTableData = (payload: string) => {
  return {
    type: DELETE_FEATURE_GROUP_TABLE_DATA,
    payload
  }
}

export const deleteFeatureTableProp = (payload: {
  tableName: string
  featureName: string
}) => {
  return {
    type: DELETE_FEATURE_GROUP_TABLE_FEATURE,
    payload
  }
}

export function setFeatureGroups(payload: IEdgeModelsState['featureGroups']) {
  return {
    type: SET_FEATURE_GROUPS,
    payload
  }
}

export function setConfigFileContents(
  payload: IEdgeModelsState['configFileData']
) {
  return {
    type: SET_CONFIG_FILE_CONTENT,
    payload
  }
}

export function setTestDataFileContents(
  payload: IEdgeModelsState['testDataFileContent']
) {
  return {
    type: SET_TEST_FILE_CONTENT,
    payload
  }
}
