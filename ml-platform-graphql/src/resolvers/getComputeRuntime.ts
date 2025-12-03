import { WithdrawalsIO } from "../utils"

export const getComputeRuntime = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getComputeRuntimeLoader.load(JSON.stringify(args))
