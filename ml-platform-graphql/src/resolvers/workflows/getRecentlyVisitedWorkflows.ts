import { WithdrawalsIO } from "../../utils"

export const getRecentlyVisitedWorkflows =
  (io: WithdrawalsIO) => (current: Object, args: any, request: any) =>
    request.loader.getRecentlyVisitedWorkflowsLoader.load(JSON.stringify(args))
