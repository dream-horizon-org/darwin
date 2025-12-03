const DataLoader = require('dataloader')
import * as R from 'ramda'
import { camelToSnakeObject, getAppLayerServiceNameForCompute } from '../../utils/utils'
import { WithdrawalsIO } from '../../utils'
const computeServiceName = getAppLayerServiceNameForCompute()
const chronosServiceName = 'MLP_CHRONOS' // Service name, not URL

export const getFilterOptionsLoader = (io: WithdrawalsIO, request: any) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/filters`,
          R.merge({service: computeServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getRecentlyVisitedClustersLoader = (io: WithdrawalsIO, request: any) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/recently-visited`,
          R.merge({service: computeServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getSearchedClustersLoader = (io: WithdrawalsIO, request: any) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        const formattedArgs = camelToSnakeObject(parsedArgs)
        return io.HTTP.post(
          `/search`,
          R.merge({service: computeServiceName}, request.headers),
          formattedArgs
        )
      })
  )

export const addRecentlyVisitedResolverLoader = (io: WithdrawalsIO, request: any) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.post(
          `/recently-visited`,
          R.merge({service: computeServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getLogGroupsLoader = (io: WithdrawalsIO, request: any) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(args as any)
        return io.HTTP.get(
          `/api/v1/cluster/sessions/${parsedArgs.cluster_id}`,
          R.merge({service: chronosServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getLogLevelsLoader = (io: WithdrawalsIO, request: any) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/severities`,
          R.merge({service: chronosServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getLogComponentsLoader = (io: WithdrawalsIO, request: any) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/api/v1/cluster/sources`,
          R.merge({service: chronosServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getEventTypesLoader = (io: WithdrawalsIO, request: any) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        return io.HTTP.get(
          `/events/default-logs`,
          R.merge({service: computeServiceName}, request.headers),
          JSON.parse(arg as any)
        )
      })
  )

export const getLogsLoader = (io: WithdrawalsIO, request: any) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(arg as any)
        return io.HTTP.post(
          `/api/v1/cluster/events`,
          R.merge({service: chronosServiceName}, request.headers),
          parsedArgs
        )
      })
  )

export const getLogLineDetailsLoader = (io: WithdrawalsIO, request: any) =>
  new DataLoader(
    async (args) =>
      await args.map((arg) => {
        const parsedArgs = JSON.parse(arg as any)
        return io.HTTP.get(
          `/api/v1/processed_events/${parsedArgs.processed_event_id}`,
          R.merge({service: chronosServiceName}, request.headers),
          parsedArgs
        )
      })
  )

export const loaders = {
  getRecentlyVisitedClustersLoader,
  getFilterOptionsLoader,
  getSearchedClustersLoader,
  addRecentlyVisitedResolverLoader,
  getLogGroupsLoader,
  getLogLevelsLoader,
  getLogComponentsLoader,
  getEventTypesLoader,
  getLogsLoader,
  getLogLineDetailsLoader,
}
