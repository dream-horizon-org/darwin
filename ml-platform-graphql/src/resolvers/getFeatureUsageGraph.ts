import { WithdrawalsIO } from "../utils"

export const getFeatureUsageGraph = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getFeatureUsageGraphLoader.load(JSON.stringify(args))
