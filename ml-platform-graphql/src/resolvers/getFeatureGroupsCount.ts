import { WithdrawalsIO } from "../utils"

export const getFeatureGroupsCount = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getFeatureGroupsCountLoader.load(JSON.stringify(args))
