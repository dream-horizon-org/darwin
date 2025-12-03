export const NUMBER_OF_TAGS_TO_SHOW = 2
export const START_INDEX_OF_THE_ARRAY = 0
export const RUNNING_RUN = 'running'
export const SUCCESS_RUN = 'success'
export const FAILED_RUN = 'failed'
export const QUEUED_RUN = 'queued'
export const SKIPPED_RUN = 'skipped'
export const DURATION_EXCEEDED = 'Duration exceeded'
export const SKIPPED = 'Skipped as the previous run was ongoing'
export const ZERO_OFFSET = 0
export const PAGE_SIZE = 10
export const RUN_ICON_SIZE = 24
export const WORKFLOW_ACTIONS = {
  RUN_NOW: 'Run Now',
  DELETE: 'Delete',
  PAUSE_SCHEDULE: 'Pause Schedule',
  RESTART_SCHEDULE: 'Restart Schedule',
  EDIT_WORKFLOW: 'Edit Workflow'
}
export const WORKFLOW_RUN_STATUS = {
  running: 'Running',
  success: 'Success',
  failed: 'Failed',
  queued: 'Queued',
  skipped: 'Skipped as the previous run was ongoing'
}
export const WORKFLOW_STATUS = {
  RUNNING: 'running',
  SUCCESS: 'success',
  UPDATING_ARTIFACT: 'updating_artifact',
  CREATING_ARTIFACT: 'creating_artifact',
  RESUMING: 'resuming',
  PAUSING: 'pausing'
}
export const NOTIFICATION_ON = {
  on_start: 'Run Started',
  on_success: 'Run Successful',
  on_fail: 'Run Failed',
  on_skip: 'Run Skipped'
}
export const WORKFLOW_DIALOG = {
  RUN_NOW: {
    title: 'Run Now',
    message:
      'Are you sure you want to run this workflow right now? This will be out of schedule and incur additional cost.',
    primaryBtnText: 'Run',
    secondaryBtnText: 'Cancel'
  },
  PAUSE_SCHEDULE: {
    title: 'Pause Schedule',
    message:
      'Are you sure you want to pause the schedule? No more runs will be executed.',
    primaryBtnText: 'Pause',
    secondaryBtnText: 'Cancel'
  },
  RESTART_SCHEDULE: {
    title: 'Restart Schedule',
    message:
      'Are you sure you want to resume the schedule? Runs will be executed as per the schedule.',
    primaryBtnText: 'Restart',
    secondaryBtnText: 'Cancel'
  },
  DELETE: {
    title: 'Delete Workflow',
    message: 'Are you sure you want to delete this workflow?',
    primaryBtnText: 'Delete',
    secondaryBtnText: 'Cancel'
  },
  STOP_RUN: {
    title: 'Stop Run',
    message:
      'Are you sure you want to stop an ongoing run? All computed data for this run will be lost. ',
    primaryBtnText: 'Stop',
    secondaryBtnText: 'Cancel'
  }
}
