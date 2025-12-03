import {RepairWorkflowRun, RepairWorkflowRunInput} from '.'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setRepairWorkflowRun} from '../../pages/workflowDetails/actions'

import {GQL as repairWorkflowRunGql} from './indexGql'

export const repairWorkflowRun = (
  dispatch,
  payload: RepairWorkflowRunInput
) => {
  const gql = {
    ...repairWorkflowRunGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<
    RepairWorkflowRunInput,
    RepairWorkflowRun
  >(gql)

  dispatch(
    setRepairWorkflowRun({
      status: API_STATUS.LOADING,
      data: null,
      error: null
    })
  )

  gqlResponse
    .then((response) => {
      if (response?.data?.repairWorkflowRun?.data) {
        dispatch(
          setRepairWorkflowRun({
            status: API_STATUS.SUCCESS,
            data: response.data.repairWorkflowRun?.data,
            error: null
          })
        )
      } else {
        dispatch(
          setRepairWorkflowRun({
            status: API_STATUS.ERROR,
            data: null,
            error: response?.errors
          })
        )
      }
    })
    .catch((error) => {
      dispatch(
        setRepairWorkflowRun({
          status: API_STATUS.ERROR,
          data: null,
          error: error
        })
      )
    })
}
