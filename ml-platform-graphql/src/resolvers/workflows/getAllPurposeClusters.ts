import { WithdrawalsIO } from "../../utils"

export const getAllPurposeClusters = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getAllPurposeClustersLoader.load(JSON.stringify(args))
