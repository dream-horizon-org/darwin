import { WithdrawalsIO } from "../../../../utils"

export const getLogLevelsResolver = (io: WithdrawalsIO) => (
  current: Object,
  args: any,
  request: any
) => request.loader.getLogLevelsLoader.load(JSON.stringify(args))
