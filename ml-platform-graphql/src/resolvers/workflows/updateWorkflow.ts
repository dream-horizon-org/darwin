import { WithdrawalsIO } from "../../utils"

export const updateWorkflow = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.updateWorkflowLoader.load(JSON.stringify(args))
