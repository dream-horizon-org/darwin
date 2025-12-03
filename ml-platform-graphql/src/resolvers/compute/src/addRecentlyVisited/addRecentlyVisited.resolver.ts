import { WithdrawalsIO } from "../../../../utils"

export const addRecentlyVisitedClusterResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => {
  return request.loader.addRecentlyVisitedResolverLoader.load(
    JSON.stringify(args)
  )
}
