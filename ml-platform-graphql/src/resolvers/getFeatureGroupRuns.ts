import { WithdrawalsIO } from "../utils"

export const getFeatureGroupRuns = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getFeatureGroupRunsLoader.load(JSON.stringify(args))
