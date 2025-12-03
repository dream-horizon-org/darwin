import { WithdrawalsIO } from "../../../../utils"

export const getRecentlyCisitedClustersResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.getRecentlyVisitedClustersLoader.load(
    JSON.stringify(args)
  )
}
