import {v4 as uuidv4} from 'uuid'
import {CLUSTER_TYPES} from '../../components/workflows/clusterList'
import {sourceTypes} from './constants'
import {SelectionOnTasks} from './graphqlAPIs/getWorkflowDetails'
import {SelectionOnPackages} from './graphqlAPIs/getWorkflowTaskDetailsWithoutRun'
import {WORKFLOW_STANDARDS_FAILED} from './pages/workflows/constants'
import {
  IWorkflowCreateForm,
  IWorkflowTaskCluster,
  IWorkflowTaskForm
} from './types/common.types'

interface CronFields {
  minute: string
  hour: string
  day: string
  month: string
  week: string
  isOnce?: boolean
}

export const getSourcePath = (task: IWorkflowTaskForm) => {
  if (task.source === sourceTypes[0].value) {
    return task.workspacePath.split('/').slice(0, 3).join('/')
  } else if (task.source === sourceTypes[1].value) {
    return task.gitRepo
  }
}

export const getFilePath = (task: IWorkflowTaskForm) => {
  if (task.source === sourceTypes[0].value) {
    return task.workspacePath.split('/').slice(3).join('/')
  } else if (task.source === sourceTypes[1].value) {
    return task.filePath
  }
}

export const parseCronString = (cronString: string): CronFields | null => {
  // Handle @once case for Airflow compatibility
  if (cronString === '@once') {
    return {
      minute: '',
      hour: '',
      day: '',
      month: '',
      week: '',
      isOnce: true
    }
  }

  const cronFields: string[] = cronString.split(/\s+/)

  if (cronFields.length !== 5) {
    return null // Invalid cron string
  }

  const [minute, hour, day, month, week] = cronFields

  return {minute, hour, day, month, week, isOnce: false}
}

export const buildCronString = (fields: CronFields): string => {
  // Handle @once case
  if (fields.isOnce) {
    return '@once'
  }

  if (
    fields.minute &&
    fields.hour &&
    fields.day &&
    fields.month &&
    fields.week
  ) {
    return `${fields.minute} ${fields.hour} ${fields.day} ${fields.month} ${fields.week}`
  } else {
    return ''
  }
}

export const getWorkspacePath = (task: SelectionOnTasks) => {
  if (task.source_type === sourceTypes[0].value) {
    return task.source + '/' + task.file_path
  }

  return ''
}

export const getParsedTasks = (
  tasks: SelectionOnTasks[]
): IWorkflowTaskForm[] => {
  return tasks.map((task) => {
    const {
      task_name,
      source_type,
      source,
      file_path,
      attached_cluster,
      depends_on,
      input_parameters,
      dynamic_artifact,
      retries,
      timeout,
      dependent_libraries,
      ha_config,
      trigger_rule,
      notification_preference,
      notify_on,
      packages
    } = task

    const isParamsPresent = Object.keys(input_parameters || []).length > 0
    const cluster: IWorkflowTaskCluster = {
      id: attached_cluster.cluster_id,
      name: attached_cluster.cluster_name,
      cores: attached_cluster.cores.toString(),
      memory: attached_cluster.memory.toString(),
      status: attached_cluster.cluster_status,
      type: attached_cluster.cluster_status
        ? CLUSTER_TYPES.ALL_PURPOSE
        : CLUSTER_TYPES.JOB,
      estimatedCost: attached_cluster.estimated_cost,
      runtime: attached_cluster.runtime,
      createdAt: attached_cluster.created_at
    }
    return {
      id: uuidv4(),
      name: task_name,
      source: source_type,
      workspacePath: getWorkspacePath(task),
      gitRepo: source_type === sourceTypes[1].value ? source : '',
      filePath: source_type === sourceTypes[1].value ? file_path : '',
      dynamicCode: dynamic_artifact,
      cluster,
      dependentOn: depends_on,
      parameters: isParamsPresent
        ? Object.keys(input_parameters || []).map((param) => ({
            id: uuidv4(),
            label: param as string,
            value: getInputParametersValue(input_parameters[param])
          }))
        : [{id: uuidv4(), label: '', value: ''}],
      retries,
      timeout,
      ha_config: ha_config,
      trigger_rule: {
        id: -1,
        label: trigger_rule,
        value: trigger_rule,
        description: trigger_rule
      },
      notification_preference: notification_preference,
      notify_on: notify_on,
      packages: packages || [],
      dependentLibraries: dependent_libraries
    }
  })
}

export const getScheduleString = (data: IWorkflowCreateForm) => {
  let schedule = ''
  if (
    data.schedule.minutes &&
    data.schedule.hours &&
    data.schedule.dayOfMonth &&
    data.schedule.month &&
    data.schedule.dayOfWeek
  ) {
    schedule = buildCronString({
      minute: data.schedule.minutes,
      hour: data.schedule.hours,
      day: data.schedule.dayOfMonth,
      month: data.schedule.month,
      week: data.schedule.dayOfWeek,
      isOnce: data.schedule.isOnce
    })
  }

  return schedule
}

export const getWorkflowParameters = (
  parameters: IWorkflowTaskForm['parameters']
) => {
  const workflowParameters = {}
  parameters.forEach((param) => {
    if (param.label && param.value) {
      workflowParameters[param.label] = param.value
    } else if (param.label) {
      workflowParameters[param.label] = ''
    }
  })
  return workflowParameters
}

export const getParsedWorkflowParameters = (parameters: object) => {
  const workflowParameters = []
  Object.keys(parameters).forEach((param) => {
    if (param && parameters[param]) {
      workflowParameters.push({
        id: uuidv4(),
        label: param,
        value: parameters[param]
      })
    }
  })
  return workflowParameters
}

export const getInputParamters = (task: IWorkflowTaskForm) => {
  const inputParameters = {}
  task.parameters.forEach((param) => {
    if (param.label && param.value) {
      inputParameters[param.label] = param.value
    } else if (param.label) {
      inputParameters[param.label] = ''
    }
  })
  return inputParameters
}

export const shouldShowClusterLinks = (clusterStatus: string) => {
  if (!clusterStatus || clusterStatus === WORKFLOW_STANDARDS_FAILED) {
    return false
  }
  return true
}

export const getInputParametersValue = (inputParameterValue) => {
  if (typeof inputParameterValue === 'object') {
    return JSON.stringify(inputParameterValue)
  }
  return inputParameterValue
}

export const filterValidWorkflowParameters = (
  parameters: IWorkflowTaskForm['parameters']
): IWorkflowTaskForm['parameters'] => {
  return parameters.filter((parameter) => {
    const {label, value} = parameter
    return label.trim() !== '' && value.trim() !== ''
  })
}
