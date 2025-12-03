import { WithdrawalsIO } from "../utils"

export const getActionGroups = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getActionGroupsLoader.load(JSON.stringify(args))
