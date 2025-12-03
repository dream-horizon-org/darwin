import {SelectionOnData as SelectionOnFeatureData} from '../../featureStoreV2/graphqlAPIs/getFeatures/index'
import {SelectionOnData} from '../graphQL/queries/getModelDeploymentForId/index'
import {IEdgeModelsState} from './reducer'

export type transformedDataType = Pick<
  SelectionOnData,
  | 'id'
  | 'deploymentName'
  | 'modelType'
  | 'modelName'
  | 'mlFlowModel'
  | 'mlFlowVersion'
  | 'tags'
  | 'configFilePath'
  | 'testDataPath'
  | 'modelArtifactPath'
  | 'compatibleAppVersions'
> & {
  eventTables: TEventTables
  featureGroupTables: TFeatureGroupTables
  compatibleAppVersionsSemver: string[]
}

export type EditableObjectType = {
  deploymentName: boolean
  tags: boolean
  modelSelection: boolean
  eventTable: boolean
  compatibleAppVersion: boolean
}

export enum ModelTableHeader {
  NAME = 'Name',
  TYPE = 'Type',
  TAGS = 'Tags',
  OWNER = 'Owner',
  LAST_MODIFIED = 'Last Modified',
  STATUS = 'Status'
}

export enum ModelActions {
  ADD = 'ADD'
}

export enum ModelVersionActions {
  DOWNLOAD = 'DOWNLOAD'
}

export enum ModelVersionTableHeaders {
  VERSION = 'Version',
  LAST_UPDATED = 'Last Updated',
  TAGS = 'Tags',
  STATUS = 'Status',
  APP_VERSIONS = 'App Versions',
  ACTIONS = 'ACTIONS'
}

export enum ModelVersionStatus {
  'LIVE' = 'LIVE',
  'READY' = 'READY',
  'FAILED' = 'FAILED',
  'IN_PROGRESS' = 'IN_PROGRESS'
}

export type ModelVersionCellData = {
  [ModelVersionTableHeaders.VERSION]: string
  [ModelVersionTableHeaders.LAST_UPDATED]: Date
  [ModelVersionTableHeaders.STATUS]: ModelVersionStatus
  [ModelVersionTableHeaders.TAGS]: string[]
  [ModelVersionTableHeaders.APP_VERSIONS]: string
  [ModelVersionTableHeaders.ACTIONS]: ModelVersionActions[]
}

export type ModelTableCellData = {
  deploymentName: string
  status: string
  type: string
  tags: string[]
  modelName: string
  createdAt: string
}

export type ModelCellData = ModelTableCellData

export type IParsedFilterQuery = {
  status?: string[]
  owners?: string[]
  owned_by_me?: string[]
}

export type TEventPropData = {
  propName: string
  propNameMapping: string
  defaultVal: string
  sqlDataType: string
}

export type TEventData = {
  tableName: string
  expiryInSecs: number
  queries: string[]
  id?: string
  eventData: {
    eventName: string
    type: string
    props: TEventPropData[]
  }
  appVersionSemver: string
}

export type TEventTables = {
  data: TEventData[]
}

export type TFeatureData = {
  featureName: string
  defaultVal: string
  sqlDataType: string
}

export type TFeatureGroupData = {
  tableName: string
  queries: string[]
  id?: string
  featureGroupData: {
    featureGroupName: string
    features: TFeatureData[]
  }
}

export type TFeatureGroupTables = {
  data: TFeatureGroupData[]
}

export interface ICreateDataProps {
  configFilePath: string
  testDataFilePath: string
  mlFlowModelInfo: IEdgeModelsState['mlFlowModelDetails']
  eventTablesDetails: IEdgeModelsState['eventTablesDetails']
  featureGroupTablesDetails: IEdgeModelsState['featureGroupTablesDetails']
  isModelNameValid: IEdgeModelsState['isModelNameValid']
  deploymentTags: string[]
  clearEdgeModelData?: () => void
  compatibleAppVersions: IEdgeModelsState['compatibleAppVersions']
}

export type SelectedData = Map<
  string,
  {
    columnName: string
    defaultVal: string | number | boolean
    sqlDataType: string
  }
>

interface Data {
  propName: string
  sqlDataType: string
  columnName: string
  defaultValue: string | number
}

export interface HeadCell {
  disablePadding: boolean
  id: keyof Data
  label: string
  numeric: boolean
}

interface FeatureData {
  featureName: string
  sqlDataType: string
  defaultValue: string | number
}

export interface FeatureHeadCell {
  disablePadding: boolean
  id: keyof FeatureData
  label: string
  numeric: boolean
}

export interface CreateDeploymentRequestData {
  deploymentName: string
  modelType: string
  mlFlowModel: string
  owner: string
  mlFlowVersion: number
  tags: string[]
  configFilePath: string
  testDataPath: string
  modelArtifactPath: string
  compatibleAppVersions: string[]
  eventTables: EventTable[]
}

export interface EventTable {
  tableName: string
  expiryInSecs: number
  queries: string[]
  eventData: EventData
}

export interface EventData {
  eventName: string
  type: string
  props: Prop[]
}

export interface Prop {
  propName: string
  propNameMapping: string
  defaultVal: string
  sqlDataType: string
}

export enum DeploymentTableHeader {
  APPVERSION = 'App Version',
  STATUS = 'Status',
  APPNAME = 'Platform',
  ACTION = 'Action'
}

export enum Flow {
  CREATE = 'Create',
  Detail = 'Detail',
  Edit = 'Edit'
}

export enum TableTypeEnum {
  FEATURE = 'FEATURE',
  EVENT = 'EVENT'
}

export interface FeatureDataType {
  loading: boolean
  data: SelectionOnFeatureData[]
  totalRows: number
}

export type FeatureComputeQueriesType = {
  inputs: {
    name: string
    queries: string[]
  }[]
  tempTables: {
    name: string
    query: string
  }[]
}

export type KeyValuePair = {[key: string]: unknown}

export type TestGQLData = {
  tempTableName: string
  data: KeyValuePair[]
}

export type TestEventData = {
  eventName: string
  data: KeyValuePair[]
}

export type TestEventDataMapping = {
  eventTableName: string
  data: KeyValuePair[]
}

export type InputFeature = {input: unknown[]; delta: number}

export type TestDataType = {
  gqlData: TestGQLData[]
  eventsData: TestEventData[]
  predict: InputFeature
}
