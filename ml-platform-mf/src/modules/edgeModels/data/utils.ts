import type {History} from 'history'
import {ModelDeploymentModelType} from '../../../gql-enums/model-deployment-model-type.enum'
import {gqlRequestTyped} from '../../../utils/gqlRequestTyped'
import {defaultFeature} from '../components/FeatureGroupsListing/constants'
import {
  CreateModelDeployment,
  CreateModelDeploymentInput
} from '../graphQL/mutations/createModelDeployment/index'
import {GQL as createModelDeploymentGql} from '../graphQL/mutations/createModelDeployment/indexGql.js'
import {
  UpdateModelDeployment,
  UpdateModelDeploymentInput
} from '../graphQL/mutations/updateModelDeployment/index'
import {GQL as updateModelDeploymentGql} from '../graphQL/mutations/updateModelDeployment/indexGql.js'
import {SelectionOnAppVersions} from '../graphQL/queries/getAppVersions'
import type {
  SelectionOnAndroidfull,
  SelectionOnAndroidfull1,
  SelectionOnEvents,
  SelectionOnGlobalProperties,
  SelectionOnIos,
  SelectionOnIos1,
  SelectionOnPropertyMetadata
} from '../graphQL/queries/getEventSchema/index'
import {
  SelectionOnCompatibleAppVersions,
  SelectionOnEventTables,
  SelectionOnFeatureGroupTables
} from '../graphQL/queries/getModelDeploymentForId/index'
import type {SelectionOnGetModelDeploymentForId} from '../graphQL/queries/getModelDeploymentForId/index.js'
import type {GetModelDeploymentsInput} from '../graphQL/queries/getModelDeployments/index'
import {
  GetMLFlowModelArtifactUrl,
  GetMLFlowModelArtifactUrlInput
} from '../graphQL/queries/mlflow/getMLFlowModelArtifactUrl'
import {GQL as getMLFlowModelArtifactUrlGql} from '../graphQL/queries/mlflow/getMLFlowModelArtifactUrl/indexGql'
import {EdgeModelsQueryParams, sqlToJsTypeMapping} from './constants'
import {FeatureComputeSchemaType, TestDataSchemaType} from './schema'
import {
  FeatureComputeQueriesType,
  FeatureHeadCell,
  Flow,
  HeadCell,
  ICreateDataProps,
  IParsedFilterQuery,
  KeyValuePair,
  SelectedData,
  TestEventDataMapping,
  TEventData,
  TEventPropData,
  TEventTables,
  TFeatureData,
  TFeatureGroupData,
  TFeatureGroupTables
} from './types'
import {
  TestDataType,
  TestEventData,
  TestGQLData,
  transformedDataType
} from './types'
import {EditableObjectType} from './types'

export enum StatusEnum {
  VALIDATING_EVENTS = 'VALIDATING_EVENTS',
  EVENTS_VALIDATION_FAILED = 'EVENTS_VALIDATION_FAILED',
  EVENTS_VALIDATION_SUCCESS = 'EVENTS_VALIDATION_SUCCESS',
  VALIDATING_FEATURE_COMPUTE = 'VALIDATING_FEATURE_COMPUTE',
  FEATURE_COMPUTE_VALIDATION_FAILED = 'FEATURE_COMPUTE_VALIDATION_FAILED',
  FEATURE_COMPUTE_VALIDATION_SUCCESS = 'FEATURE_COMPUTE_VALIDATION_SUCCESS',
  CREATING_ARTIFACT = 'CREATING_ARTIFACT',
  ARTIFACT_CREATION_FAILED = 'ARTIFACT_CREATION_FAILED',
  READY_FOR_CI = 'READY_FOR_CI',
  RUNNING_CI = 'RUNNING_CI',
  CI_FAILED = 'CI_FAILED',
  CI_SUCCESS = 'CI_SUCCESS',
  READY_TO_PUBLISH = 'READY_TO_PUBLISH',
  LIVE = 'LIVE'
}

export const getHistorySearchObj = (
  newUrlQueryParams: IParsedFilterQuery,
  routeName: string
) => {
  let obj: History.LocationDescriptor<unknown> = {
    pathname: routeName
  }
  let str: string = ''
  for (const key in newUrlQueryParams) {
    if (key === EdgeModelsQueryParams.QUERY) {
      str += `${key}=${newUrlQueryParams[key]}&`
    }
    if (key === EdgeModelsQueryParams.FILTERS) {
      let temp = {}
      if (newUrlQueryParams[key].status) {
        temp['status'] = newUrlQueryParams[key].status[0]
      }
      if (newUrlQueryParams[key].owners) {
        temp['owners'] = newUrlQueryParams[key].owners
      }
      if (newUrlQueryParams[key].owned_by_me) {
        temp['owners'] = newUrlQueryParams[key].owned_by_me
      }
      if (
        Object.keys(temp).length > 0 &&
        (temp['status'] || (temp['owners'] && temp['owners'].length > 0))
      )
        str += `${key}=${encodeURIComponent(JSON.stringify(temp))}&`
    }
  }
  obj.search = str !== '' && `?${str}`
  return obj
}

export const getModelReqPayload = (
  searchQuery: string,
  parsedFiltersQuery: IParsedFilterQuery,
  currentPage: number
): GetModelDeploymentsInput => {
  const statusFilter = getFilterValues('status', parsedFiltersQuery)
  const payload = {
    filters: {
      name: searchQuery,
      owners: getFilterValues('owners', parsedFiltersQuery),
      status: statusFilter && statusFilter.length > 0 ? statusFilter : null
    },
    pageSize: 10,
    pageNumber: currentPage
  }
  return payload
}

const getFilterValues = (
  type: string,
  parsedFiltersQuery: IParsedFilterQuery
) => {
  if (parsedFiltersQuery && type in parsedFiltersQuery) {
    return parsedFiltersQuery[type]
  }
  return []
}

export const getISTDate = (date: string) => {
  try {
    const istDate = convertToIST(date)
    return new Date(istDate)
      .toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata'
      })
      .toUpperCase()
  } catch (error) {
    return date
  }
}

const convertToIST = (date: string) => {
  const dateInIST = new Date(date)

  const istOffset = 5.5 * 60 * 60 * 1000

  dateInIST.setTime(dateInIST.getTime() + istOffset)

  return dateInIST
}

export const isCreateModelDataValid = (data: ICreateDataProps) => {
  if (!data.isModelNameValid?.data?.deploymentName) {
    return false
  }
  if (!(data.deploymentTags && data.deploymentTags.length > 0)) {
    return false
  }
  if (data.mlFlowModelInfo.name === '' || data.mlFlowModelInfo.version === '') {
    return false
  }
  // if (!data.configFilePath || !data.testDataFilePath) {
  //   return false
  // }
  if (
    !Array.isArray(data.eventTablesDetails.data) ||
    data.eventTablesDetails.data.length === 0
  ) {
    return false
  }
  if (!(data.compatibleAppVersions && data.compatibleAppVersions.length > 0)) {
    return false
  }

  return true
}

export const getDefaultValueBasedOnDataType = (dataType: string) => {
  switch (dataType) {
    case 'string':
      return ''
    case 'integer':
      return 0
    case 'boolean':
      return false
    case 'float':
      return 0
    case 'long':
      return 0
    case 'Long':
      return 0
    default:
      return ''
  }
}

export const getDefaultValueBasedOnFeatureType = (featureType: string) => {
  switch (featureType) {
    case 'string':
    case 'str':
    case 'timestamp':
      return ''
    case 'short':
    case 'byte':
    case 'long':
    case 'bigint':
    case 'integer':
    case 'int':
    case 'float':
    case 'double':
      return 0
    case 'boolean':
      return false
    case 'decimal':
      return 0.0
    default:
      return ''
  }
}

export const getDefaultCreateQuery = (
  tableName: string,
  selectedProps: SelectedData
): string => {
  let columnNames = ''
  for (const [key, value] of selectedProps.entries()) {
    columnNames += `${value.columnName} ${value.sqlDataType.toUpperCase()}, `
  }
  return `CREATE TABLE IF NOT EXISTS ${tableName} (${columnNames.slice(
    0,
    columnNames.length - 2
  )});`
}

export const getPropsFromMapping = (
  selectedEventProps: SelectedData
): TEventPropData[] => {
  const props = []

  for (const key of selectedEventProps.keys()) {
    props.push({
      propName: key,
      propNameMapping: selectedEventProps.get(key).columnName,
      defaultVal: selectedEventProps.get(key).defaultVal.toString(),
      sqlDataType: selectedEventProps.get(key).sqlDataType
    })
  }

  return props
}

export const getFeaturePropsFromMapping = (
  selectedEventProps: SelectedData
): TFeatureData[] => {
  const props = []
  for (const key of selectedEventProps.keys()) {
    props.push({
      featureName: key,
      defaultVal: selectedEventProps.get(key).defaultVal.toString(),
      sqlDataType: selectedEventProps.get(key).sqlDataType
    })
  }

  return props
}

export const headCells: readonly HeadCell[] = [
  {
    id: 'propName',
    numeric: false,
    disablePadding: true,
    label: 'Prop Name'
  },
  {
    id: 'sqlDataType',
    numeric: true,
    disablePadding: false,
    label: 'Data Type'
  },
  {
    id: 'columnName',
    numeric: true,
    disablePadding: false,
    label: 'Event Table Column Name'
  },
  {
    id: 'defaultValue',
    numeric: true,
    disablePadding: false,
    label: 'Default Value'
  }
]

export const featureHeadCells: readonly FeatureHeadCell[] = [
  {
    id: 'featureName',
    numeric: false,
    disablePadding: true,
    label: 'Feature Name'
  },
  {
    id: 'sqlDataType',
    numeric: true,
    disablePadding: false,
    label: 'Data Type'
  },
  {
    id: 'defaultValue',
    numeric: true,
    disablePadding: false,
    label: 'Default Value'
  }
]

export const combineEventTables = (
  eventTablesDetails: TEventTables,
  deploymentEventTables: TEventTables
): TEventTables => {
  const updatedEventTables = {data: [] as TEventData[]}

  const deploymentTableMap = new Map(
    deploymentEventTables?.data?.map((deploymentEventTable) => [
      deploymentEventTable.tableName,
      deploymentEventTable.id
    ])
  )

  eventTablesDetails?.data?.forEach((eventTable) => {
    if (deploymentTableMap.has(eventTable.tableName)) {
      updatedEventTables.data.push({
        ...eventTable,
        id: deploymentTableMap.get(eventTable.tableName)
      })
    } else {
      const {id, ...eventTableWithoutId} = eventTable
      updatedEventTables.data.push(eventTableWithoutId)
    }
  })

  return updatedEventTables
}

export const combineFeatureGroupTables = (
  featureGroupTablesDetails: TFeatureGroupTables,
  deploymentFeatureGroupTables: TFeatureGroupTables
): TFeatureGroupTables => {
  const updatedFeatureGroupTables = {data: [] as TFeatureGroupData[]}

  const deploymentTableMap = new Map(
    deploymentFeatureGroupTables?.data?.map((deploymentFeatureGroupTable) => [
      deploymentFeatureGroupTable.tableName,
      deploymentFeatureGroupTable.id
    ])
  )
  featureGroupTablesDetails?.data?.forEach((featureGroupTable) => {
    if (deploymentTableMap.has(featureGroupTable.tableName)) {
      updatedFeatureGroupTables.data.push({
        ...featureGroupTable,
        id: deploymentTableMap.get(featureGroupTable.tableName)
      })
    } else {
      const {id, ...featureGroupTableWithoutId} = featureGroupTable
      updatedFeatureGroupTables?.data?.push(featureGroupTableWithoutId)
    }
  })
  return updatedFeatureGroupTables
}

export const updateModelDeploymentApi = async (data) => {
  const mlFlowModelVersionRunId = data.mlFlowModelVersionRunId
  const artifactUri = await getArtifactPath(mlFlowModelVersionRunId)
  if (!artifactUri) return

  const user_email = JSON.parse(localStorage.getItem('x-user-details')).email

  const deploymentModelType = ModelDeploymentModelType.EDGE

  const featureGroupData = data.featureGroupTablesDetails?.data
  const eventsData = data.eventTablesDetails.data.map(
    ({appVersionSemver, ...rest}) => rest
  )

  eventsData.forEach((event) => {
    event.expiryInSec = event.expiryInSecs
    delete event.expiryInSecs
  })
  const reqData = {
    input: {
      id: data.deploymentID,
      deploymentName: data.deploymentName,
      modelType: deploymentModelType,
      mlFlowModel: data.mlFlowModelName,
      owner: user_email,
      mlFlowVersion: parseInt(data.mlFlowModelVersion),
      tags: data.deploymentTags,
      configFilePath: data.configFilePath,
      testDataPath: data.testDataPath,
      modelArtifactPath: artifactUri,
      compatibleAppVersions: data.compatibleAppVersions,
      eventTables: eventsData,
      featureGroupTables: featureGroupData || []
    }
  }
  const gql = {
    ...updateModelDeploymentGql,
    variables: reqData
  }
  const updateModelDeploymentResponse = gqlRequestTyped<
    UpdateModelDeploymentInput,
    UpdateModelDeployment
  >(gql)

  try {
    const response = await updateModelDeploymentResponse
    if (
      !response.data?.updateModelDeployment &&
      response.errors &&
      response.errors.length > 0
    ) {
      const errorMessage = response.errors
        .map((error) => error.message)
        .join(', ')
      throw new Error(errorMessage)
    }
    const success = response.data.updateModelDeployment.data.success
    return success
  } catch (error) {
    throw error
  }
}

export const createModelDeploymentApi = async (data) => {
  const mlFlowModelVersionRunId = data.mlFlowModelVersionRunId
  const artifactUri = await getArtifactPath(mlFlowModelVersionRunId)
  if (!artifactUri) return
  const user_email = JSON.parse(localStorage.getItem('x-user-details')).email

  const deploymentModelType = window.location.pathname.search('edge')
    ? ModelDeploymentModelType.EDGE
    : ModelDeploymentModelType.SERVER_SIDE

  const featureGroupData = data.featureGroupTablesDetails?.data
  const eventsData = data.eventTablesDetails.data.map(
    ({appVersionSemver, ...rest}) => rest
  )
  eventsData.forEach((event) => {
    event.expiryInSec = event.expiryInSecs
    delete event.expiryInSecs
  })
  const reqData = {
    input: {
      deploymentName: data.deploymentName,
      modelType: deploymentModelType,
      mlFlowModel: data.mlFlowModelName,
      owner: user_email,
      mlFlowVersion: parseInt(data.mlFlowModelVersion),
      tags: data.deploymentTags,
      configFilePath: data.configFilePath,
      testDataPath: data.testDataPath,
      modelArtifactPath: artifactUri,
      compatibleAppVersions: data.compatibleAppVersions,
      eventTables: eventsData,
      featureGroupTables: featureGroupData || []
    }
  }
  const gql = {
    ...createModelDeploymentGql,
    variables: reqData
  }
  const createModelDeploymentResponse = gqlRequestTyped<
    CreateModelDeploymentInput,
    CreateModelDeployment
  >(gql)

  try {
    const response = await createModelDeploymentResponse
    if (
      !response.data?.createModelDeployment &&
      response.errors &&
      response.errors.length > 0
    ) {
      const errorMessage = response.errors
        .map((error) => error.message)
        .join(', ')
      throw new Error(errorMessage)
    }
    const deploymentId =
      response.data.createModelDeployment.data.mlModelDeploymentId
    return deploymentId
  } catch (error) {
    throw error
  }
}

export const getArtifactPath = async (
  mlFlowModelVersionRunId: string
): Promise<string> => {
  const gql = {
    ...getMLFlowModelArtifactUrlGql,
    variables: {
      runId: mlFlowModelVersionRunId
    }
  }
  const getAtifactPathResp = gqlRequestTyped<
    GetMLFlowModelArtifactUrlInput,
    GetMLFlowModelArtifactUrl
  >(gql)
  try {
    const response = await getAtifactPathResp
    const artifactUrlResponse = response.data?.getMLFlowModelArtifactUrl
    if (
      !(
        (artifactUrlResponse && artifactUrlResponse.files) ||
        artifactUrlResponse.files.length
      )
    ) {
      throw new Error('Artifact not found')
    }

    const ortPath = artifactUrlResponse.files.find((file) =>
      file?.path.endsWith('.ort')
    )

    if (!(ortPath && ortPath.path)) {
      throw new Error('ORT file not found in the artifact')
    }

    const artifactUri = artifactUrlResponse.root_uri + '/' + ortPath.path
    return artifactUri
  } catch (error) {
    throw error
  }
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeEventTablesData(
  stateData: TEventData[],
  payload: TEventData[]
) {
  stateData.map((stateDataItem, index, array) => {
    const payloadItemTableName = payload[index].tableName
    if (stateDataItem.tableName === payloadItemTableName) {
      return {
        ...stateDataItem,
        ...payload[index]
      }
    } else {
      array.push(payload[index])
    }
  })
  return stateData
}

const groupAppVersionsByAppName = (
  TappVersions: SelectionOnCompatibleAppVersions[]
) => {
  const groupedAppVersions = []

  TappVersions.forEach((appVersion) => {
    const {appName} = appVersion
    let existingAppGroup = groupedAppVersions.find(
      (group) => group.appName === appName
    )

    if (!existingAppGroup) {
      existingAppGroup = {appName, appVersions: []}
      groupedAppVersions.push(existingAppGroup)
    }

    existingAppGroup.appVersions.push({
      appName: appVersion.appName,
      codepushVersion: appVersion.codepushVersion,
      id: appVersion.id,
      semver: appVersion.semver,
      buildNumber: appVersion.buildNumber
    })
  })

  return groupedAppVersions
}

export const transformDetailsData = (
  modelDeploymentInfo: SelectionOnGetModelDeploymentForId
): transformedDataType => {
  const {data: deploymentData} = modelDeploymentInfo
  return {
    ...deploymentData,
    eventTables: {
      data: deploymentData.eventTables?.map(
        (eventTable: SelectionOnEventTables) => ({
          ...eventTable,
          expiryInSecs: eventTable.expiryInSecs || null,
          eventData: {
            ...eventTable.eventData,
            props: eventTable.eventData.props.map((prop) => ({
              ...prop
            }))
          },
          appVersionSemver: eventTable.version
        })
      )
    },
    featureGroupTables: {
      data: deploymentData.featureGroupTables?.map(
        (featureGroupTable: SelectionOnFeatureGroupTables) => ({
          ...featureGroupTable,
          featureGroupData: {
            ...featureGroupTable.featureGroupData,
            features: featureGroupTable.featureGroupData.features.map(
              (prop) => ({
                ...prop
              })
            )
          }
        })
      )
    },
    compatibleAppVersionsSemver: deploymentData.compatibleAppVersions.map(
      (version) => version.id
    )
  }
}

export const transformDeploymentsData = (
  data: SelectionOnGetModelDeploymentForId
) => {
  const compatibleAppVersions = data.data.compatibleAppVersions
  return {
    compatibleAppVersions
  }
}

export const getEditableState = (
  statuses: StatusEnum[]
): EditableObjectType => {
  if (statuses.includes(StatusEnum.LIVE)) {
    return {
      deploymentName: false,
      tags: true,
      modelSelection: false,
      eventTable: false,
      compatibleAppVersion: true
    }
  }

  if (
    statuses.includes(StatusEnum.VALIDATING_EVENTS) ||
    statuses.includes(StatusEnum.CREATING_ARTIFACT) ||
    statuses.includes(StatusEnum.RUNNING_CI)
  ) {
    return {
      deploymentName: false,
      tags: false,
      modelSelection: false,
      eventTable: false,
      compatibleAppVersion: false
    }
  }

  if (
    statuses.every(
      (status) => status === StatusEnum.EVENTS_VALIDATION_FAILED
    ) ||
    statuses.every(
      (status) => status === StatusEnum.ARTIFACT_CREATION_FAILED
    ) ||
    statuses.every((status) => status === StatusEnum.READY_FOR_CI)
  ) {
    return {
      deploymentName: true,
      tags: true,
      modelSelection: true,
      eventTable: true,
      compatibleAppVersion: true
    }
  }

  if (
    statuses.includes(StatusEnum.CI_FAILED) ||
    statuses.includes(StatusEnum.READY_TO_PUBLISH)
  ) {
    return {
      deploymentName: true,
      tags: true,
      modelSelection: true,
      eventTable: true,
      compatibleAppVersion: true
    }
  }

  return {
    deploymentName: true,
    tags: true,
    modelSelection: true,
    eventTable: true,
    compatibleAppVersion: true
  }
}

export const updateEventTableData = (eventTablesData, updatedEventTable) => {
  const {eventData} = updatedEventTable
  const {eventName} = eventData

  return eventTablesData?.map((item) => {
    if (item.eventData.eventName === eventName) {
      return updatedEventTable
    }
    return item
  })
}

export const insertEventTableData = (eventTablesData, newEventTable) => {
  const {tableName, eventName} = newEventTable.eventData

  const isDuplicate = eventTablesData?.some(
    (item) =>
      item.tableName === tableName || item.eventData.eventName === eventName
  )

  if (isDuplicate) {
    return null
  }

  return [...(eventTablesData || []), newEventTable]
}

export const getInitialQuery = (
  flow: Flow,
  eventTableDetails: TEventData,
  featureGroupTableDetails: TFeatureGroupData,
  defaultCreateQuery: string
) => {
  if (flow === Flow.CREATE) {
    return new Map([[0, defaultCreateQuery]])
  }

  if (eventTableDetails && eventTableDetails.queries) {
    return new Map(
      eventTableDetails.queries.map((query, index) => [index, query])
    )
  }

  if (featureGroupTableDetails && featureGroupTableDetails.queries) {
    return new Map(
      featureGroupTableDetails.queries.map((query, index) => [index, query])
    )
  }

  return new Map([[0, defaultCreateQuery]])
}

export const mapAppVersionLabel = (appVersions: SelectionOnAppVersions[]) => {
  return appVersions?.map((appVersion) => ({
    label: appVersion.codepushVersion
      ? `${appVersion.semver} - (${appVersion.codepushVersion})`
      : appVersion.semver,
    value: appVersion.id
  }))
}

export const hasTableDelta = (
  originalTable: TEventData,
  expiryTimeInSecs: number,
  selectedProps: SelectedData
) => {
  let hasDelta = false

  if (originalTable.expiryInSecs !== expiryTimeInSecs) {
    hasDelta = true
  }

  const {props} = originalTable.eventData
  const originalPropNames = new Set(props.map((prop) => prop.propName))

  if (!hasDelta) {
    for (const prop of props) {
      const selectedProp = selectedProps.get(prop.propName)
      if (
        !selectedProp ||
        prop.propNameMapping !== selectedProp.columnName ||
        prop.defaultVal !== selectedProp.defaultVal ||
        prop.sqlDataType !== selectedProp.sqlDataType
      ) {
        hasDelta = true
        break
      }
    }
  }

  if (!hasDelta) {
    for (const propName of selectedProps.keys()) {
      if (!originalPropNames.has(propName)) {
        hasDelta = true
        break
      }
    }
  }

  return hasDelta
}

export const insertFeatureTableData = (
  featureGroupTablesData: TFeatureGroupData[],
  newFeatureGroupTable: TFeatureGroupData
) => {
  const {tableName} = newFeatureGroupTable
  const {featureGroupName} = newFeatureGroupTable.featureGroupData

  const isDuplicate = featureGroupTablesData?.some(
    (item) =>
      item.tableName === tableName ||
      item.featureGroupData.featureGroupName === featureGroupName
  )

  if (isDuplicate) {
    return null
  }

  return [...(featureGroupTablesData || []), newFeatureGroupTable]
}

export const updateFeatureTableData = (
  featureGroupTablesData: TFeatureGroupData[],
  updatedFeatureGroupTable: TFeatureGroupData
) => {
  const {featureGroupData} = updatedFeatureGroupTable
  const {featureGroupName} = featureGroupData

  return featureGroupTablesData?.map((item) => {
    if (item.featureGroupData.featureGroupName === featureGroupName) {
      return updatedFeatureGroupTable
    }
    return item
  })
}

export const hasExpiryInMins = (selectedProps: SelectedData): boolean => {
  const selectedPropsArray = [...selectedProps]

  for (const [key, value] of selectedPropsArray) {
    if (value.columnName === defaultFeature) {
      return true
    }
  }

  return false
}

export const hasFeatureTableDelta = (
  originalTable: TFeatureGroupData,
  selectedFeatures: SelectedData
) => {
  let hasDelta = false

  const {features} = originalTable.featureGroupData
  const originalFeaturesNames = new Set(
    features.map((prop) => prop.featureName)
  )

  if (!hasDelta) {
    for (const feature of features) {
      const selectedFeature = selectedFeatures.get(feature.featureName)
      if (
        !selectedFeature ||
        feature.defaultVal !== selectedFeature.defaultVal ||
        feature.sqlDataType !== selectedFeature.sqlDataType
      ) {
        hasDelta = true
        break
      }
    }
  }

  if (!hasDelta) {
    for (const featureName of selectedFeatures.keys()) {
      if (!originalFeaturesNames.has(featureName)) {
        hasDelta = true
        break
      }
    }
  }
  return hasDelta
}

const filterGlobalProperties = (
  globalProperties: Array<SelectionOnAndroidfull | SelectionOnIos> | null,
  existingProperties: Array<SelectionOnPropertyMetadata | null> | null
): Array<SelectionOnAndroidfull | SelectionOnIos> => {
  if (!globalProperties || !existingProperties) return []

  return globalProperties.filter(
    (globalProp) =>
      !existingProperties.some(
        (eventProp) => eventProp?.name === globalProp?.name
      )
  )
}
const mergeProperties = (
  eventProperties: Array<SelectionOnPropertyMetadata | null> | null,
  globalProperties: Array<SelectionOnAndroidfull | SelectionOnIos>
): Array<SelectionOnPropertyMetadata | null> => {
  return [...(eventProperties || []), ...globalProperties]
}

const mergePlatformMetadata = (
  platformMetadata: SelectionOnAndroidfull1 | SelectionOnIos1 | null,
  globalPropertiesForPlatform: Array<
    SelectionOnAndroidfull | SelectionOnIos
  > | null
): SelectionOnPropertyMetadata[] | null => {
  if (!platformMetadata || !platformMetadata.propertyMetadata) return null

  const filteredGlobalProps = filterGlobalProperties(
    globalPropertiesForPlatform,
    platformMetadata.propertyMetadata
  )

  return mergeProperties(platformMetadata.propertyMetadata, filteredGlobalProps)
}

export const mergeSelectedEventProperties = (
  event: SelectionOnEvents,
  globalProps: SelectionOnGlobalProperties
): SelectionOnEvents => {
  const mergedAndroidfullProperties = mergePlatformMetadata(
    event.metadata?.androidfull,
    globalProps.androidfull || []
  )

  const mergedIosProperties = mergePlatformMetadata(
    event.metadata?.ios,
    globalProps.ios || []
  )

  return {
    ...event,
    metadata: {
      androidfull: {
        ...event.metadata?.androidfull,
        propertyMetadata: mergedAndroidfullProperties
      },
      ios: {
        ...event.metadata?.ios,
        propertyMetadata: mergedIosProperties
      }
    }
  }
}

const constructInsertQuery = (
  // given tableName and data constructs insert query
  tableName: string,
  data: KeyValuePair
): string => {
  if (!data || Object.keys(data).length === 0 || !tableName) {
    return ''
  }
  const columns = Object.keys(data).join(', ')
  const values = Object.values(data)
    .map((value) => {
      if (value === undefined || value === null) {
        return 'NULL'
      } else if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`
      }
      return value
    })
    .join(', ')

  return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`
}

// given tableName and list of data constructs list of insert queries
const generateInsertQueries = (
  tableName: string,
  data: KeyValuePair[]
): string[] => {
  const queries: string[] = []
  if (!data || data.length === 0) return queries
  data.forEach((item) => {
    const query = constructInsertQuery(tableName, item)
    if (query !== '') {
      queries.push(query)
    }
  })
  return queries
}

// based on type parse the value
const convertToSqlDataType = (value: string, sqlDataType: string): unknown => {
  switch (sqlDataType) {
    case 'INTEGER':
    case 'INT':
    case 'FLOAT':
    case 'REAL':
    case 'LONG':
    case 'BIGINT':
      return Number(value)
    case 'BOOLEAN':
      return value.toLowerCase() === 'true'
    case 'VARCHAR':
    case 'STRING':
    default:
      return value
  }
}

// converst prop object into column object using propMapping
const mapPropDataToColumn = (
  data: KeyValuePair,
  propMapping: TEventPropData[]
): KeyValuePair => {
  const tableData: KeyValuePair = {}
  propMapping?.forEach((mapping) => {
    const {propName, propNameMapping, defaultVal, sqlDataType} = mapping
    if (data?.hasOwnProperty(propName)) {
      const value = data[propName]
      const typeOfValue = typeof value
      if (value && typeOfValue === sqlToJsTypeMapping[sqlDataType]) {
        tableData[propNameMapping] = value
      } else {
        tableData[propNameMapping] = convertToSqlDataType(
          defaultVal,
          sqlDataType
        )
      }
    } else {
      tableData[propNameMapping] = convertToSqlDataType(defaultVal, sqlDataType)
    }
  })

  if (data?.hasOwnProperty('TIMESTAMP')) {
    const value = data['TIMESTAMP']
    tableData['created_at'] = Date.now() + (value as number) * 1000
  }

  return tableData
}

// converts list of prop object into column object using propMapping
const mapPropDataToColumns = (
  data: KeyValuePair[],
  propMapping: TEventPropData[]
): KeyValuePair[] => {
  return data?.map((item) => mapPropDataToColumn(item, propMapping))
}

// given eventData, tableName and mapping transforms event-prop object (test data) to table-col object
const mapEventDataToTableData = (
  eventData: TestEventData,
  eventTableName: string,
  propMapping: TEventPropData[]
): TestEventDataMapping => {
  const {data} = eventData
  const result = mapPropDataToColumns(data, propMapping)
  return {eventTableName, data: result}
}

// using eventData and eventTableDetails maps eventData to eventTableData
const mapEventsDataToTablesData = (
  eventData: TestEventData[],
  eventTablesDetailsData: TEventData[]
): TestEventDataMapping[] => {
  const mappings: TestEventDataMapping[] = []

  eventTablesDetailsData?.forEach((tableDetail) => {
    const {tableName, eventData: tableEventData} = tableDetail
    const {eventName, props: propMapping} = tableEventData

    const matchingEvent = eventData?.find(
      (event) => event.eventName === eventName
    )
    if (matchingEvent) {
      const tableData = mapEventDataToTableData(
        matchingEvent,
        tableName,
        propMapping
      )
      mappings.push(tableData)
    }
  })

  return mappings
}

// using eventData and eventTableDetails return insert queries
export const getEventTableInsertQueries = (
  eventData: TestEventData[],
  eventTablesDetailsData: TEventData[]
) => {
  const queries: string[] = []
  const eventDataMapping = mapEventsDataToTablesData(
    eventData,
    eventTablesDetailsData
  )
  eventDataMapping?.forEach(({eventTableName, data}) => {
    const result = generateInsertQueries(eventTableName, data)
    if (result.length > 0) queries.push(...result)
  })
  return queries
}

// using gqlData constructs insert queries for temp tables
export const getTempTableInsertQueries = (gqlData: TestGQLData[]): string[] => {
  const queries: string[] = []
  gqlData?.forEach(({tempTableName, data}) => {
    const result = generateInsertQueries(tempTableName, data)
    if (result.length > 0) queries.push(...result)
  })
  return queries
}

// computes event tabke queries associated with deployment
export const getEventTablesCreateQueries = (
  eventTables: TEventTables
): string[] => {
  if (!eventTables || !eventTables.data) {
    return []
  }
  return eventTables.data.flatMap((table) => table.queries)
}

// transform fc zod type to required type
export const transformFeatureCompute = (
  input: FeatureComputeSchemaType
): FeatureComputeQueriesType => {
  return {
    inputs: input.inputs.map((input) => ({
      name: input.name || '',
      queries: input.queries || []
    })),
    tempTables: input.tempTables.map((tempTable) => ({
      name: tempTable.name || '',
      query: tempTable.query || ''
    }))
  }
}

// transform td zod type to required type
export const transformTestData = (input: TestDataSchemaType): TestDataType => {
  return {
    gqlData: Object.entries(input.gql).map(([tempTableName, records]) => ({
      tempTableName,
      data: records.map((record) => ({...record}))
    })),
    eventsData: Object.entries(input.events).map(([eventName, records]) => ({
      eventName,
      data: records.map((record) => ({...record}))
    })),
    predict: {
      input: [input.predict.input?.inputsToModel] || [],
      delta: input.predict.output[0].delta || 0
    }
  }
}

export const areVectorsEqual = (
  vectorA: any,
  vectorB: any,
  delta: number
): boolean => {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) {
    return false
  }
  if (vectorA.length !== vectorB.length) {
    return false
  }
  for (let i = 0; i < vectorA.length; i++) {
    const val1 = vectorA[i]
    const val2 = vectorB[i]

    if (Array.isArray(val1) && Array.isArray(val2)) {
      if (!areVectorsEqual(val1, val2, delta)) {
        return false
      }
    } else if (Math.abs(val1 - val2) > delta) {
      return false
    }
  }
  return true
}
