import {
  FeatureComputeQueriesType,
  ModelActions,
  ModelCellData,
  ModelTableHeader,
  ModelVersionActions,
  ModelVersionStatus,
  ModelVersionTableHeaders,
  TestDataType
} from './types'

export const MODEL_TABLE_HEADERS: ModelTableHeader[] = [
  ModelTableHeader.NAME,
  ModelTableHeader.STATUS,
  ModelTableHeader.TYPE,
  ModelTableHeader.TAGS,
  ModelTableHeader.OWNER,
  ModelTableHeader.LAST_MODIFIED
]

export const VERSION_TABLE_HEADERS: ModelVersionTableHeaders[] = [
  ModelVersionTableHeaders.VERSION,
  ModelVersionTableHeaders.LAST_UPDATED,
  ModelVersionTableHeaders.STATUS,
  ModelVersionTableHeaders.APP_VERSIONS,
  ModelVersionTableHeaders.TAGS,
  ModelVersionTableHeaders.ACTIONS
]

export const NUMBER_OF_TAGS_TO_SHOW = 2
export const START_INDEX_OF_THE_ARRAY = 0
export const RUNNING_RUN = 'running'
export const SUCCESS_RUN = 'success'
export const FAILED_RUN = 'failed'
export const QUEUED_RUN = 'queued'
export const ZERO_OFFSET = 0
export const PAGE_SIZE = 10
export const TAG_LABEL_TRUNCATE_LENGTH = 10

export enum DeploymentStatusTypes {
  READY = 'READY',
  FAILED = 'FAILED',
  DEPLOYING = 'DEPLOYING',
  TESTING = 'TESTING',
  DEPLOYED = 'DEPLOYED',
  READY_TO_TEST = 'READY_TO_TEST'
}

export enum FCValidationPhases {
  EVENT_TABLE_CREATION = 'Event table creation',
  TEMP_TABLE_CREATION = 'Temporary table creation',
  TEMP_TABLE_DATA_INSERTION = 'Temporary table data insertion',
  EVENT_TABLE_DATA_INSERTION = 'Event table data insertion',
  INPUT_QUERIES_PROCESSING = 'Input queries processing'
}

export const EdgeModelsQueryParams = {
  QUERY: 'q',
  FILTERS: 'filters'
}

export const sqlDataTypeMapping = {
  string: 'VARCHAR',
  long: 'BIGINT',
  integer: 'INT',
  boolean: 'BOOLEAN',
  float: 'REAL',
  Long: 'BIGINT'
}

export const sqlToJsTypeMapping = {
  REAL: 'number',
  BIGINT: 'number',
  INT: 'number',
  VARCHAR: 'string',
  BOOLEAN: 'boolean'
}

export const FeatureToSqlTypeMapping = {
  string: 'VARCHAR',
  str: 'VARCHAR',
  long: 'BIGINT',
  bigint: 'BIGINT',
  integer: 'INT',
  int: 'INT',
  boolean: 'BOOLEAN',
  float: 'FLOAT',
  double: 'DOUBLE',
  date: 'DATE',
  decimal: 'DECIMAL',
  short: 'SMALLINT',
  byte: 'TINYINT',
  timestamp: 'TIMESTAMP'
}

export const grafanaBaseUrl =
  'https://grafana.example.com/d/bb036ccb-34e3-4b5a-841d-0a841ea4fe21/ml-on-edge?orgId=1'
