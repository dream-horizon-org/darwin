import { WithdrawalsIO } from "../utils"

export const getClusterResources = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getClusterResourcesLoader.load(JSON.stringify(args))
