import {API_STATUS} from '../../../utils/apiUtils'
import {FeatureComputeSchemaType, TestDataSchemaType} from '../data/schema'
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

import {Clear} from '@mui/icons-material'
import {SelectionOnData as SelectionOnGetFeatureGroups} from '../../featureStoreV2/graphqlAPIs/getFeatureGroups'
import {SelectionOnGetMLFlowModelVersions} from '../graphQL/queries/mlflow/getMLFlowModelVersions'
import {SelectionOnGetMLFlowRegisteredModels} from '../graphQL/queries/mlflow/getMLFlowRegisteredModels/index'
import {TEventTables, TFeatureGroupTables} from './types'
import {
  insertEventTableData,
  insertFeatureTableData,
  updateEventTableData,
  updateFeatureTableData
} from './utils'

export interface ValidDeploymentState {
  deploymentName: string
}

export interface IEdgeModelsState {
  isModelNameValid: {
    status: API_STATUS
    data: ValidDeploymentState
    error: any
  }
  deploymentTags: string[]
  configFilePath: string
  configFileData: {
    success: boolean
    data: FeatureComputeSchemaType
    message: string
  }
  testDataFilePath: string
  testDataFileContent: {
    success: boolean
    data: TestDataSchemaType
    message: string
  }
  mlFlowRegisteredModels: {
    status: API_STATUS
    data: SelectionOnGetMLFlowRegisteredModels['registered_models']
    error: any
  }
  mlFlowModelVersions: {
    status: API_STATUS
    data: SelectionOnGetMLFlowModelVersions['model_versions']
    error: any
  }
  mlFlowModelDetails: {
    name: string
    version: string
    run_id: string
  }
  eventTablesDetails: TEventTables
  featureGroupTablesDetails: TFeatureGroupTables
  featureGroups: {
    status: API_STATUS
    data: Array<SelectionOnGetFeatureGroups | null> | null
    error: any
    totalRecordsCount: number
    cancel?: () => void
  }
  compatibleAppVersions: string[]
  isEditable: {
    deploymentName: boolean
    tags: boolean
    modelSelection: boolean
    eventTable: boolean
    compatibleAppVersion: boolean
  }
  initialEventTableDetails: TEventTables
  initialFeatureGroupTableDetails: TFeatureGroupTables
}

const initialState: IEdgeModelsState = {
  isModelNameValid: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  deploymentTags: [],
  configFilePath: '',
  configFileData: {
    success: false,
    data: null,
    message: null
  },
  testDataFilePath: '',
  testDataFileContent: {
    success: false,
    data: null,
    message: null
  },
  mlFlowRegisteredModels: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  mlFlowModelVersions: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  mlFlowModelDetails: {
    name: '',
    version: '',
    run_id: ''
  },
  eventTablesDetails: {
    data: null
  },
  featureGroupTablesDetails: {
    data: null
  },
  featureGroups: {
    status: API_STATUS.INIT,
    data: null,
    error: null,
    totalRecordsCount: 0
  },
  compatibleAppVersions: [],
  isEditable: {
    deploymentName: false,
    tags: false,
    modelSelection: false,
    eventTable: false,
    compatibleAppVersion: false
  },
  initialEventTableDetails: {
    data: null
  },
  initialFeatureGroupTableDetails: {
    data: null
  }
}

export default function edgeModelsReducer(
  state = initialState,
  action
): IEdgeModelsState {
  switch (action.type) {
    case SET_VALIDATE_MODEL_DEPLOYMENT_NAME:
      return {
        ...state,
        isModelNameValid: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error
        }
      }
    case SET_DEPLOYMENT_TAGS:
      return {
        ...state,
        deploymentTags: action.payload
      }
    case SET_CONFIG_FILE_DATA:
      return {
        ...state,
        configFilePath: action.payload
      }
    case SET_TEST_DATA_FILE_DATA:
      return {
        ...state,
        testDataFilePath: action.payload
      }
    case SET_MLFLOW_REGISTERED_MODELS:
      return {
        ...state,
        mlFlowRegisteredModels: action.payload
      }
    case SET_MLFLOW_MODEL_VERSIONS:
      return {
        ...state,
        mlFlowModelVersions: action.payload
      }
    case SET_MLFLOW_MODEL_DETAILS:
      return {
        ...state,
        mlFlowModelDetails: action.payload
      }
    case SET_EVENT_TABLE_DATA:
      const newData = action.payload.data
      return {
        ...state,
        eventTablesDetails: {
          data: newData
        }
      }
    case SET_INITIAL_EVENT_TABLE_DATA:
      const initialData = action.payload.data
      return {
        ...state,
        initialEventTableDetails: {
          data: initialData
        }
      }

    case UPDATE_EVENT_TABLE_DATA: {
      const updatedEventTable = action.payload

      const updatedEventTables = updateEventTableData(
        state.eventTablesDetails.data,
        updatedEventTable
      )

      return {
        ...state,
        eventTablesDetails: {
          ...state.eventTablesDetails,
          data: updatedEventTables
        }
      }
    }

    case INSERT_EVENT_TABLE_DATA: {
      const newEventTable = action.payload
      const updatedEventTables = insertEventTableData(
        state.eventTablesDetails.data,
        newEventTable
      )
      if (updatedEventTables === null) {
        return state
      }

      return {
        ...state,
        eventTablesDetails: {
          ...state.eventTablesDetails,
          data: updatedEventTables
        }
      }
    }
    case DELETE_EVENT_TABLE_DATA:
      const tableNameToDelete = action.payload
      return {
        ...state,
        eventTablesDetails: {
          data:
            state.eventTablesDetails.data?.filter(
              (item) => item.tableName !== tableNameToDelete
            ) || []
        }
      }
    case DELETE_EVENT_TABLE_PROP:
      const {tableName: deleteTableName, propName} = action.payload
      return {
        ...state,
        eventTablesDetails: {
          data:
            state.eventTablesDetails.data?.map((item) => {
              if (item.tableName === deleteTableName) {
                return {
                  ...item,
                  eventData: {
                    ...item.eventData,
                    props: item.eventData.props?.filter(
                      (prop) => prop.propName !== propName
                    )
                  }
                }
              }
              return item
            }) || []
        }
      }

    case SET_EDITABLE_FIELDS:
      return {
        ...state,
        isEditable: {
          ...state.isEditable,
          ...action.payload
        }
      }

    case SET_COMPATIBLE_APP_VERSIONS:
      return {
        ...state,
        compatibleAppVersions: action.payload
      }
    case CLEAR_EDGE_MODEL_DATA:
      return initialState
    case SET_FEATURE_GROUP_TABLE_DATA:
      const newTablesData = action.payload.data
      return {
        ...state,
        featureGroupTablesDetails: {
          data: newTablesData
        }
      }

    case SET_INITIAL_FEATURE_GROUP_TABLE_DATA:
      const initialTablesData = action.payload.data
      return {
        ...state,
        initialFeatureGroupTableDetails: {
          data: initialTablesData
        }
      }

    case UPDATE_FEATURE_GROUP_TABLE_DATA: {
      const updatedFeatureGroupTable = action.payload
      const updatedFeatureGroupTables = updateFeatureTableData(
        state.featureGroupTablesDetails.data,
        updatedFeatureGroupTable
      )
      return {
        ...state,
        featureGroupTablesDetails: {
          ...state.featureGroupTablesDetails,
          data: updatedFeatureGroupTables
        }
      }
    }

    case INSERT_FEATURE_GROUP_TABLE_DATA: {
      const newFeatureGroupTable = action.payload
      const updatedFeatureGroupTables = insertFeatureTableData(
        state.featureGroupTablesDetails.data,
        newFeatureGroupTable
      )
      if (updatedFeatureGroupTables === null) {
        return state
      }

      return {
        ...state,
        featureGroupTablesDetails: {
          ...state.featureGroupTablesDetails,
          data: updatedFeatureGroupTables
        }
      }
    }

    case DELETE_FEATURE_GROUP_TABLE_DATA:
      const featureGroupTableNameToDelete = action.payload
      return {
        ...state,
        featureGroupTablesDetails: {
          data:
            state.featureGroupTablesDetails.data?.filter(
              (item) => item.tableName !== featureGroupTableNameToDelete
            ) || []
        }
      }

    case DELETE_FEATURE_GROUP_TABLE_FEATURE:
      const {tableName: deleteFeatureTableName, featureName: featurePropName} =
        action.payload
      return {
        ...state,
        featureGroupTablesDetails: {
          data:
            state.featureGroupTablesDetails.data?.map((item) => {
              if (item.tableName === deleteFeatureTableName) {
                const temp = {
                  ...item.featureGroupData,
                  features: item.featureGroupData.features?.filter((prop) => {
                    return prop.featureName !== featurePropName
                  })
                }
                return {
                  ...item,
                  featureGroupData: {
                    ...item.featureGroupData,
                    features: item.featureGroupData.features?.filter(
                      (prop) => prop.featureName !== featurePropName
                    )
                  }
                }
              }
              return item
            }) || []
        }
      }

    case SET_FEATURE_GROUPS: {
      return {
        ...state,
        featureGroups: {
          status: action.payload.status,
          data: action.payload.data,
          error: action.payload.error,
          totalRecordsCount:
            action.payload.totalRecordsCount ||
            action.payload.totalRecordsCount,
          cancel: action.payload.cancel
        }
      }
    }
    case SET_CONFIG_FILE_CONTENT: {
      return {
        ...state,
        configFileData: {
          success: action.payload.success,
          data: action.payload.data,
          message: action.payload.message
        }
      }
    }

    case SET_TEST_FILE_CONTENT: {
      return {
        ...state,
        testDataFileContent: {
          success: action.payload.success,
          data: action.payload.data,
          message: action.payload.message
        }
      }
    }

    default:
      return state
  }
}
