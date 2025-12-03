import { WithdrawalsIO } from "../../utils"

export const stopWorkflowRun = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.stopWorkflowRunLoader.load(JSON.stringify(args))
