import { WithdrawalsIO } from "../utils"

export const getAllClusters = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getAllClustersLoader.load(JSON.stringify(args))
