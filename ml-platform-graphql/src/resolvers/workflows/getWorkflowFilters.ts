import { WithdrawalsIO } from "../../utils"

export const getWorkflowFilters = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getWorkflowFiltersLoader.load(JSON.stringify(args))
