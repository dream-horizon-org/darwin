import { WithdrawalsIO } from "../utils"

export const stopCluster = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.stopClusterLoader.load(JSON.stringify(args))
