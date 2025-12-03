import { WithdrawalsIO } from "../utils"

export const getAllJobClustersV2 = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getAllJobClustersV2Loader.load(JSON.stringify(args))
