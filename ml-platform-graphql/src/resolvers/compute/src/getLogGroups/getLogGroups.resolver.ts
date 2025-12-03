import { WithdrawalsIO } from "../../../../utils"

export const getLogGroupsResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getLogGroupsLoader.load(JSON.stringify(args))
