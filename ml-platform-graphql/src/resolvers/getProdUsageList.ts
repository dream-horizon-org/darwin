import { WithdrawalsIO } from "../utils"

export const getProdUsageList = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getProdUsageListLoader.load(JSON.stringify(args))
