import { WithdrawalsIO } from "../utils"

export const getComputeDiscTypes = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getComputeDiscTypesLoader.load(JSON.stringify(args))
