import { WithdrawalsIO } from "../utils"

export const getComputeRuntimeList = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getComputeRuntimeListLoader.load(JSON.stringify(args))
