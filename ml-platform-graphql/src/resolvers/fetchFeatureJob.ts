import { WithdrawalsIO } from "../utils"

export const fetchFeatureJob = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.fetchFeatureJobLoader.load(JSON.stringify(args))
