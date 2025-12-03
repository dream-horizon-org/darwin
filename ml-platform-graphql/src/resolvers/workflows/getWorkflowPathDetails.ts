import { WithdrawalsIO } from "../../utils"

export const getWorkflowPathDetails = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getWorkflowPathDetailsLoader.load(JSON.stringify(args))
