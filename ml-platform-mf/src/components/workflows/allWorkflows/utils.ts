import {IWorkflowsState} from '../../../modules/workflows/pages/workflows/reducer'
import {formatTime} from '../../../utils/getDateString'
import {Data} from './columnConfig'

export const getParsedWorkflowsData = (
  data: IWorkflowsState['workflows']['data']['data']
): Data[] => {
  return data.map((workflow) => {
    return {
      id: workflow.workflow_id,
      workflowName: workflow.workflow_name,
      displayName: workflow.display_name,
      description: workflow.description,
      schedule: workflow.schedule,
      status: workflow.status,
      tags: workflow.tags,
      lastRunDetails: workflow.last_run_details,
      nextRun: workflow.next_run_time,
      owner: workflow.owner
    }
  })
}

export const getFormattedDateTime = (date) => {
  if (!date) return 'N/A'

  const dateWithMothAndDay = new Date(date)
    .toDateString()
    .split(' ')
    .slice(1)
    .join(' ')

  const dateArr = dateWithMothAndDay.split(' ')
  const newDateArr = [
    dateArr.slice(0, 2).join(' '),
    dateArr[2],
    formatTime(new Date(date))
  ]

  return newDateArr.join(', ')
}
