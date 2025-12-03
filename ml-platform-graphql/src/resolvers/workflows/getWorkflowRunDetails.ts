import { WithdrawalsIO } from "../../utils"

export const getWorkflowRunDetails = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getWorkflowRunDetailsLoader.load(JSON.stringify(args))
