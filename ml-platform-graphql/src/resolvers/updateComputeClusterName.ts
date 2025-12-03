import { WithdrawalsIO } from "../utils"

export const updateComputeClusterName = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.updateComputeClusterNameLoader.load(JSON.stringify(args))
