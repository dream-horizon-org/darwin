import {createRuntimeResolver} from './src/createRuntime/createRuntime.resolver'
import {deleteRuntimeResolver} from './src/deleteRuntime/deleteRuntime.resolver'
import {getRuntimeDetailsResolver} from './src/getRuntimeDetails/getRuntimeDetails.resolver'
import {getRuntimesInformationResolver} from './src/getRuntimesInformation/getRuntimesInformation.resolver'

export const queries = {
  getRuntimesInformation: getRuntimesInformationResolver,
  getRuntimeDetails: getRuntimeDetailsResolver,
}
export const mutations = {
  deleteRuntime: deleteRuntimeResolver,
  createRuntime: createRuntimeResolver,
}
