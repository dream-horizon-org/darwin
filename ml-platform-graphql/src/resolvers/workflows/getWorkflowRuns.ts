import { WithdrawalsIO } from "../../utils"

export const getWorkflowRuns = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getWorkflowRunsLoader.load(JSON.stringify(args))
