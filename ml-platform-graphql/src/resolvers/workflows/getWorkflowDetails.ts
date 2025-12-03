import { WithdrawalsIO } from "../../utils"

export const getWorkflowDetails = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getWorkflowDetailsLoader.load(JSON.stringify(args))
