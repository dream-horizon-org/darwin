import { WithdrawalsIO } from "../../utils"

export const getWorkflows = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getWorkflowsLoader.load(JSON.stringify(args))
