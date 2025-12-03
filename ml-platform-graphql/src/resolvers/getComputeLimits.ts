import { WithdrawalsIO } from "../utils"

export const getComputeLimits = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getComputeLimitsLoader.load(JSON.stringify(args))
