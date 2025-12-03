import { WithdrawalsIO } from "../../utils"

export const runWorkflowRun = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.runWorkflowRunLoader.load(JSON.stringify(args))
