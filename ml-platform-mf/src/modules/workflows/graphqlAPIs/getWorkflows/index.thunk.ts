import {GetWorkflows, GetWorkflowsInput} from '.'
import {API_STATUS} from '../../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../../utils/gqlRequestTyped'
import {setRecentlyCreated, setWorkflows} from '../../pages/workflows/actions'
import {GQL as getWorkflowsGql} from './indexGql'

export const getWorkflows = (
  dispatch,
  payload: GetWorkflowsInput,
  isRecentlyCreatedByYou: boolean = false,
  oldData: GetWorkflows['getWorkflows'] = null
) => {
  const gql = {
    ...getWorkflowsGql,
    variables: payload
  }

  const gqlResponse = gqlRequestTyped<GetWorkflowsInput, GetWorkflows>(gql)

  if (isRecentlyCreatedByYou) {
    dispatch(
      setRecentlyCreated({
        status: API_STATUS.LOADING,
        data: null,
        error: null
      })
    )
  } else {
    dispatch(
      setWorkflows({
        status: API_STATUS.LOADING,
        data: oldData ? oldData : null,
        error: null,
        cancel: gqlResponse.cancel
      })
    )
  }

  gqlResponse
    .then((response) => {
      if (response?.data?.getWorkflows) {
        if (isRecentlyCreatedByYou) {
          dispatch(
            setRecentlyCreated({
              status: API_STATUS.SUCCESS,
              data: response?.data?.getWorkflows,
              error: null
            })
          )
        } else {
          const newData = response.data.getWorkflows
          let finalData = null
          if (oldData) {
            finalData = {
              ...newData,
              data: [...oldData.data, ...newData.data]
            }
          } else {
            finalData = newData
          }
          dispatch(
            setWorkflows({
              status: API_STATUS.SUCCESS,
              data: finalData,
              error: null,
              cancel: null
            })
          )
        }
      } else {
        if (isRecentlyCreatedByYou) {
          dispatch(
            setRecentlyCreated({
              status: API_STATUS.ERROR,
              data: null,
              error: null
            })
          )
        } else {
          dispatch(
            setWorkflows({
              status: API_STATUS.ERROR,
              data: oldData,
              error: null,
              cancel: null
            })
          )
        }
      }
    })
    .catch((err) => {
      if (isRecentlyCreatedByYou) {
        dispatch(
          setRecentlyCreated({
            status: API_STATUS.ERROR,
            data: null,
            error: err
          })
        )
      } else {
        dispatch(
          setWorkflows({
            status: API_STATUS.ERROR,
            data: oldData,
            error: err,
            cancel: null
          })
        )
      }
    })
}
