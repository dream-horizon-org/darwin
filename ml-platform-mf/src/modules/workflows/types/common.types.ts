import {SelectionOnPackages} from '../graphqlAPIs/createWorkflow'

interface ITriggerRule {
  id: number
  label: string
  value: string
  description: string
}

export interface IWorkflowTaskParams {
  id: string
  label: string
  value: string
}

export interface IWorkflowTaskCluster {
  id: string
  name: string
  cores: string
  memory: string
  status: string
  type: string
  runtime: string
  estimatedCost: string
  createdAt: string
}

export interface ITaskNotificationPreference {
  on_fail: boolean
}
export interface IWorkflowTaskForm {
  id: string
  name: string
  source: string
  workspacePath: string
  gitRepo: string
  filePath: string
  dynamicCode: boolean
  cluster: IWorkflowTaskCluster
  packages: Array<SelectionOnPackages | null> | null
  dependentLibraries: string
  dependentOn: string[]
  parameters: IWorkflowTaskParams[]
  retries: number
  timeout: number
  notify_on: string
  trigger_rule: ITriggerRule
  notification_preference: ITaskNotificationPreference
}

export interface ISchedule {
  minutes: string
  hours: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
  isOnce: boolean
}

export interface INotificationPreference {
  on_start: boolean
  on_success: boolean
  on_fail: boolean
  on_skip: boolean
}

export interface IWorkflowCreateForm {
  tasks: IWorkflowTaskForm[]
  name: string
  displayName: string
  isWorkflowNameUnique: boolean
  description: string
  tags: string[]
  schedule: ISchedule
  maxConcurrentRuns: number
  numberOfRetries: number
  parameters: IWorkflowTaskParams[]
  slackChannel: string
  enableHA: boolean
  notifications: number
  queueEnabled: boolean
  notification_preference: INotificationPreference
}

export interface IWorkflowUpdateScheduleForm {
  schedule: ISchedule
}

export interface IWorkflowUpdateMaxRunsForm {
  maxConcurrentRuns: number
}

export interface IWorkflowUpdateRetriesForm {
  numberOfRetries: number
}
