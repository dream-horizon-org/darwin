/* eslint no-unused-vars: 0 */
import {FetchMockClass} from '../../tests/testBootstrap'

const slidingTimer = () => {
  return new Promise((resolve) => {
    return resolve({
      getTokenSilently: () => {
        return new Promise((resolve) => {
          return resolve(1)
        })
      }
    })
  })
}
export const mockGql = (
  name,
  query,
  variables,
  slidingWindow = slidingTimer
) => {
  const fetchMockObj = FetchMockClass.getInstance()
  return new Promise((resolve, reject) => {
    if (
      fetchMockObj.getMockConfig().status === 500 ||
      fetchMockObj.getMockConfig().status === 400
    ) {
      reject({})
    }
    resolve(fetchMockObj.getMockConfig().returnBody)
  })
}
