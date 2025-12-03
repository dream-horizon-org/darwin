import {IWorkflowsDetailsState} from '../../../modules/workflows/pages/workflowDetails/reducer'
import {Data} from './columnConfig'

export const getParsedWorkflowRunsData = (
  data: IWorkflowsDetailsState['workflowRuns']['data']['data']['runs']
): Data[] => {
  return data.map((run) => {
    return {
      runId: run.run_id,
      duration: run.duration,
      startTime: run.start_time,
      trigger: run.trigger,
      triggerBy: run.trigger_by,
      status: run.run_status,
      isRunDurationExceeded: run.is_run_duration_exceeded,
      expectedRunDuration: run.expected_run_duration
    }
  })
}

export const getFormatedDateRange = (startDate: Date, endDate: Date) => {
  startDate = new Date(startDate)
  endDate = new Date(endDate)

  return `${startDate.getDate()}/${
    startDate.getMonth() + 1
  }/${startDate.getFullYear()} - ${endDate.getDate()}/${
    endDate.getMonth() + 1
  }/${endDate.getFullYear()}`
}
