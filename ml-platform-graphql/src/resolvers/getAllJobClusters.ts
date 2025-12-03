import { WithdrawalsIO } from "../utils"

export const getAllJobClusters = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getAllJobClustersLoader.load(JSON.stringify(args))
