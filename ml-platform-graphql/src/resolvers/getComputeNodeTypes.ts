import { WithdrawalsIO } from "../utils"

export const getComputeNodeTypes = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getComputeNodeTypesLoader.load(JSON.stringify(args))
