import { WithdrawalsIO } from "../utils"

export const getFeatures = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getFeaturesLoader.load(JSON.stringify(args))
