import {gqlRequestTyped} from '../../../../../utils/gqlRequestTyped'
import {setClusterCancellationForPolling} from '../../actions'
import {GetComputeCluster, GetComputeClusterInput} from './getClusterStatus'

import {GQL as getClusterStatusGql} from './getClusterStatusGql'

export const getClusterStatus = async (data, dispatch, retries = 0) => {
  if (!data.clusterId) return
  const gql = {
    ...getClusterStatusGql,
    variables: data
  }

  const gqlRequest = gqlRequestTyped<GetComputeClusterInput, GetComputeCluster>(
    gql
  )

  dispatch(
    setClusterCancellationForPolling({
      cancel: gqlRequest.cancel
    })
  )

  const res = await gqlRequest

  if (
    res.data &&
    res.data.getComputeCluster &&
    res.data.getComputeCluster.data &&
    res.data.getComputeCluster.data.status !== 'active'
  ) {
    const controller = new AbortController()
    const signal = controller.signal
    dispatch(
      setClusterCancellationForPolling({
        cancel: controller.abort.bind(controller)
      })
    )

    try {
      await longRunningOperation(signal)
    } catch (err) {
      return
    }

    return getClusterStatus(data, dispatch, ++retries)
  } else if (
    res.data &&
    res.data.getComputeCluster &&
    res.data.getComputeCluster.data &&
    res.data.getComputeCluster.data.status === 'active'
  ) {
    return res
  } else {
    return getClusterStatus(data, dispatch, ++retries)
  }
}

const longRunningOperation = async (signal) => {
  return new Promise(async (resolve, reject) => {
    const onAbort = () => {
      reject(new Error('Operation cancelled'))
    }

    waitForme().then(() => {
      if (!signal.aborted) {
        resolve(1)
      }
    }, reject)

    signal.addEventListener('abort', onAbort)
  })
}

const waitForme = () =>
  new Promise((res, rej) => {
    setTimeout(() => res(1), 1000 * 10)
  })
