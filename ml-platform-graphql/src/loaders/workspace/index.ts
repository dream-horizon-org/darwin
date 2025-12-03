import DataLoader = require('dataloader')
import * as R from 'ramda'
import {getAppLayerServiceNameForWorkspace} from '../../utils/utils'

const workspaceServiceName = getAppLayerServiceNameForWorkspace()

const getAllCodespacesLoader = (io, request) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/codespaces`,
          R.merge({service: workspaceServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const loaders = {
  getAllCodespacesLoader,
}
