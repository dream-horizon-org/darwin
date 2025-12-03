import { WithdrawalsIO } from "../utils"

export const getComputeRuntimeDetails = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getComputeRuntimeDetailsLoader.load(JSON.stringify(args))
