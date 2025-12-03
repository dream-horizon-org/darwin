import { WithdrawalsIO } from "../../utils"

export const getWorkflowsAttachedToCluster = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) =>
  request.loader.getWorkflowsAttachedToClusterLoader.load(JSON.stringify(args))
