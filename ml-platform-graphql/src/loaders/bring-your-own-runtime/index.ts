const DataLoader = require('dataloader')
import * as R from 'ramda'
import {
  camelToSnakeObject,
  getAppLayerServiceNameForBringYourOwnRuntime,
} from '../../utils/utils'
const bringYourOwnRuntimeServiceName = getAppLayerServiceNameForBringYourOwnRuntime()
export const createRuntimeLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(arg as any)
        const formattedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/custom-runtime`,
          R.merge({service: bringYourOwnRuntimeServiceName}, request.headers),
          formattedArgs
        )
      })
  )

export const deleteRuntimeLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(arg as any)
        const formattedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/custom-runtime/delete`,
          R.merge({service: bringYourOwnRuntimeServiceName}, request.headers),
          formattedArgs
        )
      })
  )

export const getRuntimeDetailsLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(arg as any)
        const formattedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/custom-runtime/details`,
          R.merge({service: bringYourOwnRuntimeServiceName}, request.headers),
          formattedArgs
        )
      })
  )

export const getRuntimesInformationLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(arg as any)
        const formattedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/custom-runtime/search`,
          R.merge({service: bringYourOwnRuntimeServiceName}, request.headers),
          formattedArgs
        )
      })
  )
export const loaders = {
  getRuntimesInformationLoader,
  deleteRuntimeLoader,
  getRuntimeDetailsLoader,
  createRuntimeLoader,
}
