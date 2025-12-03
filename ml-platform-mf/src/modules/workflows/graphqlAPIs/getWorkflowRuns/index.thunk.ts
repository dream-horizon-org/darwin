import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {GetWorkflowRuns, GetWorkflowRunsInput} from './index'

import {API_STATUS} from '../../../../utils/apiUtils'
import {setWorkflowRuns} from '../../pages/workflowDetails/actions'
import {IWorkflowsDetailsState} from '../../pages/workflowDetails/reducer'
import {GQL as getWorkflowRunsGql} from './indexGql'

export const getWorkflowRuns = (
  dispatch,
  payload: GetWorkflowRunsInput,
  oldData?: IWorkflowsDetailsState['workflowRuns']['data']
) => {
  const gql = {
    ...getWorkflowRunsGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<GetWorkflowRunsInput, GetWorkflowRuns>(
    gql
  )

  dispatch(
    setWorkflowRuns({
      status: API_STATUS.LOADING,
      data: oldData || null,
      error: null
    })
  )
  gqlResponse
    .then((response) => {
      if (response?.data?.getWorkflowRuns) {
        const workflowRunsData = [
          ...(oldData?.data?.runs || []),
          ...(response.data.getWorkflowRuns?.data?.runs || [])
        ]
        const workflowRunsResponse = {
          ...response?.data?.getWorkflowRuns,
          data: {
            ...response?.data?.getWorkflowRuns?.data,
            runs: workflowRunsData,
            repair_run:
              oldData?.data?.repair_run ||
              response?.data?.getWorkflowRuns?.data?.repair_run
          }
        }
        dispatch(
          setWorkflowRuns({
            status: API_STATUS.SUCCESS,
            data: workflowRunsResponse,
            error: null
          })
        )
      } else {
        dispatch(
          setWorkflowRuns({
            status: API_STATUS.ERROR,
            data: oldData,
            error: null
          })
        )
      }
    })
    .catch((err) => {
      dispatch(
        setWorkflowRuns({
          status: API_STATUS.ERROR,
          data: oldData,
          error: err
        })
      )
    })
}
