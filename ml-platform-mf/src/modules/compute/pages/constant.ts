export const CLUSTER_NAME_TRUNCATE_LENGTH = 25
export const RUNTIME_NAME_TRUNCATE_LENGTH = 25
export const CREATED_BY_TRUNCATE_LENGTH = 25

export const EVENT_TYPES_WITH_FILE_LOGS = [
  'INIT_SCRIPT_EXECUTION_STARTED',
  'INIT_SCRIPT_EXECUTION_SUCCESSFUL',
  'INIT_SCRIPT_EXECUTION_FAILED'
]
export const TAB_CONFIG = {
  configuration: 0,
  libraries: 1,
  logs: 2,
  dashboards: 3
}

export const CLUSTER_LIBRARY_STATUS = {
  failed: 'Failed',
  success: 'Installed',
  running: 'Installing',
  uninstall_pending: 'Uninstall Pending',
  created: 'Created'
}

export enum RuntimeOptionIds {
  CLASS_HEADER = -1,
  TYPE_HEADER = -2,
  LOAD_MORE = -3
}

export enum NodeTypeValue {
  GPU = 'gpu',
  CPU = 'cpu'
}
